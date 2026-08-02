import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { PhishingResult } from '../types/phishing';

export interface HeatMapToken {
  text: string;
  intensity: 0 | 1 | 2 | 3 | 4;
  category?: string;
}

export interface ThreatExplanation {
  title: string;
  description: string;
  tips: string[];
}

interface ThreatHeatMapCardProps {
  title: string;
  icon: ReactNode;
  tokens: HeatMapToken[];
  result?: PhishingResult;
  itemLabel?: string;
  emptyMessage: string;
  getCategoryLabel: (category: string) => string;
  getThreatExplanation: (category: string) => ThreatExplanation;
}

const legend = [
  { label: 'Low Risk', className: 'bg-success/15 border-success text-success' },
  { label: 'Medium Risk', className: 'bg-warning/20 border-warning text-warning' },
  { label: 'High Risk', className: 'bg-danger/25 border-danger text-danger' },
  { label: 'Critical', className: 'bg-danger/45 border-danger text-danger font-semibold' }
];

const tokenClass = (intensity: HeatMapToken['intensity']) => {
  switch (intensity) {
    case 1:
      return 'bg-success/15 text-success border-b-2 border-success';
    case 2:
      return 'bg-warning/25 text-warning-foreground border-b-2 border-warning font-medium';
    case 3:
      return 'bg-danger/25 text-danger border-b-2 border-danger font-semibold';
    case 4:
      return 'bg-danger/45 text-danger border-b-2 border-danger font-bold';
    default:
      return 'text-foreground';
  }
};

export const ThreatHeatMapCard = ({
  title,
  icon,
  tokens,
  result,
  itemLabel = 'indicators',
  emptyMessage,
  getCategoryLabel,
  getThreatExplanation
}: ThreatHeatMapCardProps) => {
  const [selectedThreat, setSelectedThreat] = useState<HeatMapToken | null>(null);
  const suspiciousCount = tokens.filter(token => token.intensity > 1).length;
  const hasRiskSignals = tokens.some(token => token.intensity > 1);
  const explanation = selectedThreat?.category ? getThreatExplanation(selectedThreat.category) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden rounded-2xl border-border bg-gradient-card shadow-xl">
          <div className="border-b border-border/70 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {icon}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Review each highlighted part before trusting it.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {result ? (
                  <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 font-medium text-muted-foreground">
                    Analysis score: <span className="text-foreground">{result.score}/100</span>
                  </span>
                ) : (
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 font-medium text-primary">Live scan</span>
                )}
                {suspiciousCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/10 px-2.5 py-1 font-medium text-danger">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {suspiciousCount} {itemLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Heat map legend">
              {legend.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
                  <span className={`h-3.5 w-3.5 rounded border ${item.className}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="max-h-[300px] min-h-[76px] overflow-y-auto rounded-xl border border-border bg-background/60 p-4 shadow-inner">
              {tokens.length > 0 ? (
                <div className="whitespace-pre-wrap break-words text-sm leading-7">
                  {tokens.map((token, index) => {
                    const isClickable = token.intensity > 0 && Boolean(token.category);
                    return (
                      <motion.span
                        key={`${token.text}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.008, 0.25) }}
                        className={`rounded px-0.5 transition-opacity ${tokenClass(token.intensity)} ${isClickable ? 'cursor-pointer hover:opacity-75' : ''}`}
                        title={isClickable ? `Click to learn about ${getCategoryLabel(token.category || '')}` : undefined}
                        onClick={() => isClickable && setSelectedThreat(token)}
                      >
                        {token.text}
                      </motion.span>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[44px] items-center justify-center text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              )}
            </div>

            <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${hasRiskSignals ? 'border-primary/20 bg-primary/5 text-muted-foreground' : 'border-success/20 bg-success/5 text-muted-foreground'}`}>
              {hasRiskSignals ? <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
              <p>{hasRiskSignals ? 'Click a highlighted item to see why it matters and how to stay safe.' : 'No strong local indicators were found. Continue to verify the source and context.'}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog open={Boolean(selectedThreat)} onOpenChange={() => setSelectedThreat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {explanation?.title || 'Heat map indicator'}
            </DialogTitle>
          </DialogHeader>
          {selectedThreat && explanation && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/50 p-3">
                <p className="text-sm font-medium text-muted-foreground">Detected item</p>
                <p className="mt-1 break-all text-lg font-bold text-primary">“{selectedThreat.text}”</p>
              </div>
              <p className="text-sm text-muted-foreground">{explanation.description}</p>
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Protection tips</p>
                <ul className="space-y-2">
                  {explanation.tips.map(tip => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-primary">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
