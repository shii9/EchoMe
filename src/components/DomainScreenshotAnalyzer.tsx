import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';

// ---------------------------------------------------------------------------
// Image-preprocessing helpers
// ---------------------------------------------------------------------------

/** Apply a 3×3 unsharp-mask (sharpening) kernel via convolution. */
function applySharpen(data: Uint8ClampedArray, w: number, h: number): void {
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0,
  ];
  const src = new Uint8ClampedArray(data);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            val += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        data[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, val));
      }
    }
  }
}

/** Convert to greyscale in-place. */
function toGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = g;
  }
}

/** Apply Otsu-style adaptive global threshold → binary image. */
function applyOtsuThreshold(data: Uint8ClampedArray, invert = false): void {
  // Build histogram
  const hist = new Array<number>(256).fill(0);
  for (let i = 0; i < data.length; i += 4) hist[data[i]]++;

  const total = data.length / 4;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0, wB = 0, max = 0, thresh = 0;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > max) { max = between; thresh = t; }
  }

  for (let i = 0; i < data.length; i += 4) {
    const bin = invert
      ? (data[i] > thresh ? 0 : 255)
      : (data[i] > thresh ? 255 : 0);
    data[i] = data[i + 1] = data[i + 2] = bin;
  }
}

/** Stretch contrast so the darkest pixel → 0 and brightest → 255. */
function stretchContrast(data: Uint8ClampedArray): void {
  let lo = 255, hi = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < lo) lo = data[i];
    if (data[i] > hi) hi = data[i];
  }
  const range = hi - lo || 1;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.round(((data[i] - lo) / range) * 255);
    data[i] = data[i + 1] = data[i + 2] = v;
  }
}

/**
 * Full preprocessing pipeline.
 * Returns two variants: light-background and dark-background (inverted threshold).
 */
const preprocessImage = (
  imageSrc: string,
  scale = 3.0,
  invert = false,
): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(imageSrc); return; }

      // Enable high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      toGrayscale(d);
      stretchContrast(d);
      applySharpen(d, canvas.width, canvas.height);
      applyOtsuThreshold(d, invert);

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });

// ---------------------------------------------------------------------------
// OCR post-processing helpers
// ---------------------------------------------------------------------------

/** Clean common Tesseract noise characters and normalise whitespace. */
function cleanOcrText(raw: string): string {
  return raw
    // Remove lone junk glyphs that OCR introduces
    .replace(/[|\\{}[\]<>]/g, ' ')
    // Collapse multiple spaces/tabs
    .replace(/[ \t]{2,}/g, ' ')
    // Remove lines that are entirely non-alphanumeric
    .split('\n')
    .map(l => l.trim())
    .filter(l => /[a-zA-Z0-9]/.test(l))
    .join('\n')
    .trim();
}

/**
 * Extract high-value tokens: URLs, domains, IPs, email addresses.
 * These are surfaced first so the analyser gets the most useful signals.
 */
function extractKeyTokens(text: string): string[] {
  const patterns: RegExp[] = [
    // Full URLs
    /https?:\/\/[^\s"'<>]+/gi,
    // Domains (including subdomains)
    /(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+(?:com|net|org|io|gov|edu|co|uk|de|fr|ru|cn|jp|in|au|ca|br|mx|info|biz|xyz|online|site|tech|store|app|dev|ly|me|ai|tk|ml|ga|cf)/gi,
    // IPv4
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    // Email
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g,
  ];
  const found = new Set<string>();
  for (const re of patterns) {
    const matches = text.matchAll(re);
    for (const m of matches) found.add(m[0]);
  }
  return [...found];
}

/** Pick the OCR result with the highest confidence and most extracted tokens. */
function chooseBestResult(
  results: Array<{ text: string; confidence: number }>,
): string {
  let best = results[0];
  for (const r of results) {
    if (r.confidence > best.confidence) best = r;
  }
  return best.text;
}

// ---------------------------------------------------------------------------
// Tesseract helpers
// ---------------------------------------------------------------------------

async function runTesseract(
  imgSrc: string,
  onProgress: (p: number) => void,
): Promise<{ text: string; confidence: number }> {
  const result = await Tesseract.recognize(imgSrc, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round((m.progress as number) * 100));
      }
    },
  });
  return {
    text: cleanOcrText(result.data.text),
    confidence: result.data.confidence,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DomainScreenshotAnalyzer = ({ onAnalyze }: { onAnalyze: (text: string) => void }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');
  const [extractedTokens, setExtractedTokens] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setExtractedTokens([]);
    const reader = new FileReader();
    reader.onload = e => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) { processFile(file); break; }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const analyzeScreenshot = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    setExtractedTokens([]);

    try {
      // --- Pass 1: high-scale light-background preprocessing ---
      setStage('Enhancing image…');
      const lightVariant = await preprocessImage(image, 3.0, false);

      setStage('OCR pass 1 / 2…');
      const r1 = await runTesseract(lightVariant, p => setProgress(Math.round(p * 0.45)));

      // --- Pass 2: inverted (dark-background sites) ---
      setStage('OCR pass 2 / 2…');
      const darkVariant = await preprocessImage(image, 3.0, true);
      const r2 = await runTesseract(darkVariant, p => setProgress(45 + Math.round(p * 0.45)));

      // --- Merge & choose best ---
      setStage('Finalising…');
      setProgress(95);

      const bestText = chooseBestResult([r1, r2]);

      // Combine unique lines from both passes for maximum coverage
      const allLines = new Set([
        ...r1.text.split('\n').map(l => l.trim()),
        ...r2.text.split('\n').map(l => l.trim()),
      ]);
      const mergedText = [...allLines].filter(Boolean).join('\n');

      // Extract high-value tokens from the merged result
      const tokens = extractKeyTokens(mergedText.length > bestText.length ? mergedText : bestText);
      setExtractedTokens(tokens);

      const finalText = tokens.length
        ? `${tokens.join('\n')}\n\n---\n${bestText}`
        : bestText;

      setProgress(100);

      if (finalText.trim()) {
        onAnalyze(finalText);
        toast.success(
          tokens.length
            ? `Extracted ${tokens.length} domain/URL token${tokens.length > 1 ? 's' : ''} — ready to analyse!`
            : 'Text extracted and ready for analysis.',
        );
      } else {
        toast.error('No text could be extracted. Try a clearer or higher-resolution screenshot.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      toast.error('An error occurred during text extraction.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStage('');
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <FileSearch className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Domain Screenshot Analysis</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
          Multi-pass OCR
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
        >
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Upload or drag & drop a screenshot
          </span>
          <span className="text-xs text-muted-foreground">PNG, JPG, or WEBP image</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={image} alt="Domain screenshot" className="w-full h-auto" />
          </div>

          {/* Progress bar */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{stage}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extracted tokens preview */}
          <AnimatePresence>
            {extractedTokens.length > 0 && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Detected Tokens
                </div>
                {extractedTokens.map((t, i) => (
                  <div key={i} className="text-xs font-mono text-foreground bg-background/60 rounded px-2 py-1 truncate">
                    {t}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <Button
              onClick={analyzeScreenshot}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {stage || 'Processing…'}
                </>
              ) : (
                'Analyse with OCR'
              )}
            </Button>
            <Button
              onClick={() => { setImage(null); setExtractedTokens([]); }}
              variant="outline"
              disabled={isProcessing}
            >
              Remove
            </Button>
          </div>
        </motion.div>
      )}
    </Card>
  );
};
