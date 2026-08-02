import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { X, ArrowLeftRight, Shield, AlertTriangle, Upload, FileText } from 'lucide-react';
import { PhishingResult } from '@/types/phishing';

interface ComparisonModeProps {
  onClose: () => void;
  onAnalyze: (text: string) => Promise<PhishingResult>;
  inputType?: 'email' | 'url' | 'ip' | 'domain' | 'file';
}

export const ComparisonMode = ({ onClose, onAnalyze, inputType = 'email' }: ComparisonModeProps) => {
  const [itemA, setItemA] = useState('');
  const [itemB, setItemB] = useState('');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [resultA, setResultA] = useState<PhishingResult | null>(null);
  const [resultB, setResultB] = useState<PhishingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const getItemLabel = () => {
    switch (inputType) {
      case 'email': return 'Email';
      case 'url': return 'URL';
      case 'ip': return 'IP';
      case 'domain': return 'Domain';
      case 'file': return 'File';
      default: return 'Item';
    }
  };

  const getPlaceholder = () => {
    switch (inputType) {
      case 'email': return 'Paste first email here...';
      case 'url': return 'Paste first URL here...';
      case 'ip': return 'Paste first IP address here...';
      case 'domain': return 'Paste first domain here...';
      case 'file': return 'Paste first file name here...';
      default: return 'Paste first item here...';
    }
  };

  const getButtonText = () => {
    switch (inputType) {
      case 'email': return 'Compare Emails';
      case 'url': return 'Compare URLs';
      case 'ip': return 'Compare IPs';
      case 'domain': return 'Compare Domains';
      case 'file': return 'Compare Files';
      default: return 'Compare Items';
    }
  };

  const getSaferLabel = () => {
    switch (inputType) {
      case 'email': return 'Safer Email';
      case 'url': return 'Safer URL';
      case 'ip': return 'Safer IP';
      case 'domain': return 'Safer Domain';
      case 'file': return 'Safer File';
      default: return 'Safer Item';
    }
  };

  const handleCompare = async () => {
    const textA = inputType === 'file' ? (fileA?.name || itemA) : itemA;
    const textB = inputType === 'file' ? (fileB?.name || itemB) : itemB;

    if (!textA.trim() || !textB.trim()) return;

    setLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        onAnalyze(textA),
        onAnalyze(textB)
      ]);
      setResultA(resA);
      setResultB(resB);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 70) return 'text-warning';
    return 'text-danger';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6 bg-card border-border shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Side-by-Side Comparison</h2>
            </div>
            <button
              onClick={onClose}
              className="x-close-btn x-close-btn-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Item A */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{getItemLabel()} A</label>
              {inputType === 'file' ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
                  onClick={() => fileInputRefA.current?.click()}
                >
                  {fileA ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-primary" />
                      <p className="text-sm font-medium">{fileA.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileA.size / 1024).toFixed(1)} KB • {fileA.type || 'Unknown type'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload first file</p>
                      <p className="text-xs text-muted-foreground">Supports all file types up to 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <Textarea
                  placeholder={getPlaceholder()}
                  value={itemA}
                  onChange={(e) => setItemA(e.target.value)}
                  className="min-h-[200px] mb-4"
                />
              )}
              <input
                ref={fileInputRefA}
                type="file"
                accept="image/*, application/*, text/*, .pdf, .doc, .docx, .txt, .csv"
                className="hidden"
                onChange={(e) => {
                  setFileA(e.target.files?.[0] || null);
                  setItemA(e.target.files?.[0]?.name || '');
                }}
              />
              {resultA && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <span className="text-sm font-medium">Threat Score</span>
                    <span className={`text-3xl font-bold ${getScoreColor(resultA.score)}`}>
                      {resultA.score}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Keywords</span>
                      <span className="font-semibold">{resultA.details.keywordMatches}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">URL Issues</span>
                      <span className="font-semibold">{resultA.details.urlIssues}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sensitive</span>
                      <span className="font-semibold">{resultA.details.sensitiveRequests}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Item B */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{getItemLabel()} B</label>
              {inputType === 'file' ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
                  onClick={() => fileInputRefB.current?.click()}
                >
                  {fileB ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-primary" />
                      <p className="text-sm font-medium">{fileB.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileB.size / 1024).toFixed(1)} KB • {fileB.type || 'Unknown type'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload second file</p>
                      <p className="text-xs text-muted-foreground">Supports all file types up to 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <Textarea
                  placeholder={getPlaceholder().replace('first', 'second')}
                  value={itemB}
                  onChange={(e) => setItemB(e.target.value)}
                  className="min-h-[200px] mb-4"
                />
              )}
              <input
                ref={fileInputRefB}
                type="file"
                accept="image/*, application/*, text/*, .pdf, .doc, .docx, .txt, .csv"
                className="hidden"
                onChange={(e) => {
                  setFileB(e.target.files?.[0] || null);
                  setItemB(e.target.files?.[0]?.name || '');
                }}
              />
              {resultB && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <span className="text-sm font-medium">Threat Score</span>
                    <span className={`text-3xl font-bold ${getScoreColor(resultB.score)}`}>
                      {resultB.score}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Keywords</span>
                      <span className="font-semibold">{resultB.details.keywordMatches}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">URL Issues</span>
                      <span className="font-semibold">{resultB.details.urlIssues}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sensitive</span>
                      <span className="font-semibold">{resultB.details.sensitiveRequests}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Comparison Summary */}
          {resultA && resultB && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-card rounded-lg border border-border"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Comparison Summary
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Score Difference</p>
                  <p className="text-2xl font-bold">
                    {Math.abs(resultA.score - resultB.score)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">{getSaferLabel()}</p>
                  <p className="text-lg font-semibold">
                    {resultA.score < resultB.score ? `${getItemLabel()} A` : resultB.score < resultA.score ? `${getItemLabel()} B` : 'Equal'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Risk Assessment</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    {Math.max(resultA.score, resultB.score) >= 70 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-danger" />
                        <span className="text-danger">High Risk Detected</span>
                      </>
                    ) : (
                      <span className="text-success">Manageable Risk</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleCompare}
              disabled={
                inputType === 'file'
                  ? (!fileA || !fileB || loading)
                  : (!itemA.trim() || !itemB.trim() || loading)
              }
              className="px-8 py-6 text-base bg-gradient-primary"
            >
              {loading ? 'Comparing...' : getButtonText()}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
