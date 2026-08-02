import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, ChevronDown, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { exampleIPs, ExampleIP } from '@/data/exampleIPs';
import type { PhishingResult } from '@/types/phishing';

interface ExampleIPSelectorProps {
  onSelectIP: (content: string) => void;
  onAnalyzeIP?: (ip: string) => Promise<PhishingResult>;
  onSelectExample?: (example: ExampleIP) => void;
}

export const ExampleIPSelector = ({ onSelectIP, onSelectExample }: ExampleIPSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getCategoryIcon = (category: ExampleIP['category']) => {
    if (category === 'safe') return <ShieldCheck className="w-4 h-4 text-success" />;
    if (category === 'suspicious') return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <AlertCircle className="w-4 h-4 text-danger" />;
  };

  const getCategoryColor = (category: ExampleIP['category']) => {
    if (category === 'safe') return 'border-l-success';
    if (category === 'suspicious') return 'border-l-warning';
    return 'border-l-danger';
  };

  return (
    <div className="w-full">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="w-full justify-between border-border hover:bg-secondary/50 transition-colors">
        <span className="flex items-center gap-2"><Network className="w-4 h-4" />Try Example IPs</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4" /></motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <Card className="mt-3 p-2 sm:p-3 bg-gradient-card border-border">
              <div className="space-y-2 max-h-[min(400px,50vh)] overflow-y-auto pr-1">
                {exampleIPs.map((ip, index) => (
                  <motion.button
                    key={ip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { onSelectIP(ip.content); onSelectExample?.(ip); setIsOpen(false); }}
                    className={`w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-all border-l-4 ${getCategoryColor(ip.category)} group`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(ip.category)}
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors break-words">{ip.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 break-all">{ip.content}</p>
                      </div>
                      <span className="self-start text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground capitalize whitespace-nowrap">{ip.category}</span>
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
