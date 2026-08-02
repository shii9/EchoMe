import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Mail, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderAnalysis {
  spf: 'pass' | 'fail' | 'neutral' | 'none';
  dkim: 'pass' | 'fail' | 'none';
  dmarc: 'pass' | 'fail' | 'none';
  from: string;
  replyTo: string;
  returnPath: string;
  receivedFrom: string[];
  warnings: string[];
}

export const EmailHeaderParser = () => {
  const [headers, setHeaders] = useState('');
  const [analysis, setAnalysis] = useState<HeaderAnalysis | null>(null);

  const parseHeaders = () => {
    const warnings: string[] = [];
    
    // Extract SPF
    const spfMatch = headers.match(/spf=(pass|fail|neutral|none)/i);
    const spf = spfMatch ? (spfMatch[1].toLowerCase() as HeaderAnalysis['spf']) : 'none';
    if (spf === 'fail') warnings.push('⚠️ SPF check failed - sender may be spoofed');

    // Extract DKIM
    const dkimMatch = headers.match(/dkim=(pass|fail|none)/i);
    const dkim = dkimMatch ? (dkimMatch[1].toLowerCase() as HeaderAnalysis['dkim']) : 'none';
    if (dkim === 'fail') warnings.push('⚠️ DKIM signature invalid');

    // Extract DMARC
    const dmarcMatch = headers.match(/dmarc=(pass|fail|none)/i);
    const dmarc = dmarcMatch ? (dmarcMatch[1].toLowerCase() as HeaderAnalysis['dmarc']) : 'none';
    if (dmarc === 'fail') warnings.push('⚠️ DMARC check failed');

    // Extract From
    const fromMatch = headers.match(/From: (.+)/i);
    const from = fromMatch ? fromMatch[1].trim() : 'Not found';

    // Extract Reply-To
    const replyToMatch = headers.match(/Reply-To: (.+)/i);
    const replyTo = replyToMatch ? replyToMatch[1].trim() : 'None';
    if (replyTo !== 'None' && replyTo !== from) {
      warnings.push('⚠️ Reply-To address differs from From address');
    }

    // Extract Return-Path
    const returnPathMatch = headers.match(/Return-Path: (.+)/i);
    const returnPath = returnPathMatch ? returnPathMatch[1].trim() : 'Not found';

    // Extract Received headers
    const receivedMatches = headers.match(/Received: from (.+?)[\n\r]/gi);
    const receivedFrom = receivedMatches ? receivedMatches.map(r => r.replace(/Received: from /i, '').trim()) : [];

    if (receivedFrom.length > 10) {
      warnings.push('⚠️ Unusual number of mail server hops detected');
    }

    setAnalysis({
      spf,
      dkim,
      dmarc,
      from,
      replyTo,
      returnPath,
      receivedFrom,
      warnings
    });
  };

  const getStatusIcon = (status: string) => {
    if (status === 'pass') return <CheckCircle className="w-4 h-4 text-success" />;
    if (status === 'fail') return <XCircle className="w-4 h-4 text-danger" />;
    return <AlertTriangle className="w-4 h-4 text-warning" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'pass') return 'bg-success/20 text-success';
    if (status === 'fail') return 'bg-danger/20 text-danger';
    return 'bg-warning/20 text-warning';
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Email Header Analysis</h3>
          <p className="text-sm text-muted-foreground">Verify SPF, DKIM, DMARC and sender authenticity</p>
        </div>
      </div>

      <Textarea
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
        placeholder="Paste email headers here..."
        className="min-h-[200px] mb-4 font-mono text-sm"
      />

      <Button onClick={parseHeaders} disabled={!headers.trim()} className="w-full mb-4">
        Analyze Headers
      </Button>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-lg border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">SPF Status</span>
                {getStatusIcon(analysis.spf)}
              </div>
              <Badge className={getStatusColor(analysis.spf)}>
                {analysis.spf.toUpperCase()}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Sender Policy Framework</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-lg border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">DKIM Status</span>
                {getStatusIcon(analysis.dkim)}
              </div>
              <Badge className={getStatusColor(analysis.dkim)}>
                {analysis.dkim.toUpperCase()}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">DomainKeys Identified Mail</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-lg border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">DMARC Status</span>
                {getStatusIcon(analysis.dmarc)}
              </div>
              <Badge className={getStatusColor(analysis.dmarc)}>
                {analysis.dmarc.toUpperCase()}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Domain-based Message Auth</p>
            </motion.div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">From:</span>
              <span className="ml-2 font-mono">{analysis.from}</span>
            </div>
            {analysis.replyTo !== 'None' && (
              <div>
                <span className="text-muted-foreground">Reply-To:</span>
                <span className="ml-2 font-mono">{analysis.replyTo}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Return-Path:</span>
              <span className="ml-2 font-mono">{analysis.returnPath}</span>
            </div>
          </div>

          {analysis.warnings.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <p className="font-semibold text-warning mb-2">Security Warnings:</p>
              <ul className="space-y-1 text-sm">
                {analysis.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.receivedFrom.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Mail Server Path ({analysis.receivedFrom.length} hops):</p>
              <div className="bg-secondary/30 rounded-lg p-3 max-h-40 overflow-y-auto">
                {analysis.receivedFrom.slice(0, 5).map((server, i) => (
                  <p key={i} className="text-xs font-mono text-muted-foreground">{server}</p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
};
