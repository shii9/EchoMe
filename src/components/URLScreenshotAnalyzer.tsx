import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';

export const URLScreenshotAnalyzer = ({ onAnalyze }: { onAnalyze: (text: string) => void }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Upscale by 2x for better text clarity
        const scale = 2.0;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image and enhance
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Increase contrast
        const factor = (259 * (50 + 255)) / (255 * (259 - 50));

        for (let i = 0; i < data.length; i += 4) {
          // Grayscale
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

          // Apply contrast
          let val = factor * (gray - 128) + 128;
          val = Math.max(0, Math.min(255, val));

          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  const analyzeScreenshot = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const enhancedImage = await preprocessImage(image);

      const result = await Tesseract.recognize(
        enhancedImage,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const extractedText = result.data.text.trim();

      if (extractedText) {
        onAnalyze(extractedText);
        toast.success('Screenshot analyzed! Webpage text extracted and ready for analysis.');
      } else {
        toast.error('No text could be extracted from the screenshot. Please try a different image.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('An error occurred during text extraction.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">URL Screenshot Analysis</h3>
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
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">Upload or drag and drop Webpage Screenshot</span>
          <span className="text-xs text-muted-foreground">PNG, JPG, or WEBP (or Paste)</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={image} alt="Webpage screenshot" className="w-full h-auto" />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={analyzeScreenshot}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Text... {progress > 0 && `${progress}%`}
                </>
              ) : (
                'Analyze with OCR'
              )}
            </Button>
            <Button
              onClick={() => setImage(null)}
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
