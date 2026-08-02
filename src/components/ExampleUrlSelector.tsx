import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, ChevronDown, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { exampleUrls, ExampleUrl } from '@/data/exampleUrls';
import type { PhishingResult } from '@/types/phishing';

interface ExampleUrlSelectorProps {
  onSelectUrl: (content: string, example?: ExampleUrl) => void;
  onAnalyzeUrl?: (url: string) => Promise<PhishingResult>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ExampleUrlSelector = ({ onSelectUrl, isOpen: externalIsOpen, onOpenChange }: ExampleUrlSelectorProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen ?? internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const getCategoryIcon = (category: ExampleUrl['category']) => {
    if (category === 'safe') return <ShieldCheck className="w-4 h-4 text-success" />;
    if (category === 'suspicious') return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <AlertCircle className="w-4 h-4 text-danger" />;
  };

  const getCategoryColor = (category: ExampleUrl['category']) => {
    if (category === 'safe') return 'border-l-success';
    if (category === 'suspicious') return 'border-l-warning';
    return 'border-l-danger';
  };

  return (
    <div className="w-full">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="w-full justify-between border-border hover:bg-secondary/50 transition-colors">
        <span className="flex items-center gap-2"><Link className="w-4 h-4" />Try Example URLs</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4" /></motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <Card className="mt-3 p-2 sm:p-3 bg-gradient-card border-border">
              <div className="space-y-2 max-h-[min(400px,50vh)] overflow-y-auto pr-1">
                {exampleUrls.map((url, index) => (
                  <motion.button
                    key={url.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { onSelectUrl(url.content, url); setIsOpen(false); }}
                    className={`w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-all border-l-4 ${getCategoryColor(url.category)} group`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(url.category)}
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors break-words">{url.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 break-all">{url.content}</p>
                      </div>
                      <span className="self-start text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground capitalize whitespace-nowrap">{url.category}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
