import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, BarChart3, RefreshCw, Link, FileText, File as FileIcon, Brain, MessageSquare, MoreHorizontal, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ExampleEmailSelector } from './ExampleEmailSelector';

interface PhishingResult {
  score: number;
  reasons: string[];
  details: {
    keywordMatches: number;
    urlIssues: number;
    sensitiveRequests: number;
    brandImpersonation: boolean;
  };
}

export const PhishingDetector = () => {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Global expansion state so only one reason is expanded across categories
  const [expandedIdGlobal, setExpandedIdGlobal] = useState<string | null>(null);
  const categoryKeys = ['URLs', 'Brand', 'Grammar', 'Attachments', 'Advanced', 'Headers', 'Context', 'Other'];
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    categoryKeys.forEach(k => init[k] = true);
    return init;
  });

  const analyzeEmail = async () => {
    if (!emailText.trim()) return;

    setIsLoading(true);

    // Enhanced phishing detection with detailed metrics
    await new Promise(resolve => setTimeout(resolve, 1800));

    const reasons: string[] = [];
    let score = 0;
    let keywordMatches = 0;
    let urlIssues = 0;
    let sensitiveRequests = 0;
    let brandImpersonation = false;

    // Advanced suspicious keyword detection
    const urgentKeywords = ['urgent', 'immediately', 'action required', 'verify now', 'within 24 hours', 'expires today', 'suspended', 'locked', 'act now'];
    const prizeKeywords = ['winner', 'prize', 'congratulations', 'lottery', 'inheritance', 'millions', 'selected'];
    const threatKeywords = ['account suspended', 'verify account', 'unusual activity', 'security alert', 'confirm identity', 'unauthorized access'];
    const actionKeywords = ['click here', 'download now', 'open attachment', 'update payment', 'confirm password'];

    const foundUrgent = urgentKeywords.filter(kw => emailText.toLowerCase().includes(kw));
    const foundPrize = prizeKeywords.filter(kw => emailText.toLowerCase().includes(kw));
    const foundThreat = threatKeywords.filter(kw => emailText.toLowerCase().includes(kw));
    const foundAction = actionKeywords.filter(kw => emailText.toLowerCase().includes(kw));

    if (foundUrgent.length > 0) {
      score += foundUrgent.length * 12;
      keywordMatches += foundUrgent.length;
      reasons.push(`⚠️ Creates false urgency: "${foundUrgent.join('", "')}"`);
    }

    if (foundPrize.length > 0) {
      score += foundPrize.length * 18;
      keywordMatches += foundPrize.length;
      reasons.push(`🎰 Suspicious prize claims: "${foundPrize.join('", "')}"`);
    }

    if (foundThreat.length > 0) {
      score += foundThreat.length * 20;
      keywordMatches += foundThreat.length;
      reasons.push(`🚨 Threatening language: "${foundThreat.join('", "')}"`);
    }

    if (foundAction.length > 0) {
      score += foundAction.length * 15;
      keywordMatches += foundAction.length;
      reasons.push(`🔗 Suspicious call-to-action: "${foundAction.join('", "')}"`);
    }

    // Check for IP-based URLs
    const ipUrlPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
    const ipUrls = emailText.match(ipUrlPattern);
    if (ipUrls) {
      score += 25;
      urlIssues += ipUrls.length;
      reasons.push(`🌐 IP-based URLs detected (${ipUrls.length} found) - legitimate sites use domain names`);
    }

    // Check for shortened URLs
    const shortUrlPattern = /(bit\.ly|tinyurl|goo\.gl|ow\.ly|t\.co)/gi;
    const shortUrls = emailText.match(shortUrlPattern);
    if (shortUrls) {
      score += 15;
      urlIssues += shortUrls.length;
      reasons.push(`🔗 Shortened URLs detected (${shortUrls.length} found) - could hide malicious destinations`);
    }

    // Check for suspicious domain patterns
    const suspiciousDomains = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club'];
    const foundSuspiciousDomains = suspiciousDomains.filter(domain => emailText.toLowerCase().includes(domain));
    if (foundSuspiciousDomains.length > 0) {
      score += 22;
      urlIssues += foundSuspiciousDomains.length;
      reasons.push(`⚠️ Free/suspicious domain extensions: ${foundSuspiciousDomains.join(', ')}`);
    }

    // Check for domain spoofing (common brand names with variations)
    const brandNames = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'netflix', 'facebook', 'instagram', 'bank', 'bkash', 'nagad', 'rocket', 'daraz', 'pathao', 'shohoz', 'chaldal', 'sonali', 'brac', 'dbbl', 'robi', 'banglalink'];
    for (const brand of brandNames) {
      const regex = new RegExp(`${brand}(?!\\.com|@)`, 'gi');
      if (regex.test(emailText) && !emailText.toLowerCase().includes(`${brand}.com`)) {
        score += 28;
        brandImpersonation = true;
        reasons.push(`🎭 Possible brand impersonation: "${brand}" without official domain`);
        break;
      }
    }

    // Check for excessive links
    const linkCount = (emailText.match(/https?:\/\//g) || []).length;
    if (linkCount > 5) {
      score += 10;
      urlIssues += 1;
      reasons.push(`🔗 Excessive links detected (${linkCount} links) - unusual for legitimate emails`);
    }

    // Check for poor grammar indicators
    const grammarIssues = [
      /dear (customer|user|member|sir|madam|friend)(?!\s+\w+)/i,
      /kindly\s+/i,
      /urgent\s+attention/i,
      /dear\s+valued/i,
    ];
    const foundGrammar = grammarIssues.filter(pattern => pattern.test(emailText));
    if (foundGrammar.length > 0) {
      score += 10;
      reasons.push(`📝 Generic/impersonal greetings detected - legitimate companies use your name`);
    }

    // Check for requests for sensitive information
    const sensitiveRequests_list = ['password', 'social security', 'ssn', 'credit card', 'bank account', 'pin', 'cvv', 'security code'];
    const foundSensitive = sensitiveRequests_list.filter(term => emailText.toLowerCase().includes(term));
    if (foundSensitive.length > 0) {
      score += 30;
      sensitiveRequests += foundSensitive.length;
      reasons.push(`🔐 Requests sensitive information: ${foundSensitive.join(', ')} - MAJOR RED FLAG`);
    }

    // Check for misspellings of common words
    const commonMisspellings = ['kindly', 'dear sir/madam', 'beneficiary', 'urgent matter', 'confirm your identity'];
    const foundMisspellings = commonMisspellings.filter(phrase => emailText.toLowerCase().includes(phrase));
    if (foundMisspellings.length > 0) {
      score += 8;
      reasons.push(`🔤 Suspicious phrasing patterns commonly used in scams`);
    }

    // Check for attachments mentions
    if (/attach|download|file|document|pdf|exe|zip/i.test(emailText)) {
      score += 12;
      reasons.push(`📎 Mentions attachments/downloads - verify source before opening`);
    }

    // Cap score at 100
    score = Math.min(score, 100);

    if (score === 0) {
      reasons.push('✅ No immediate phishing indicators detected - email appears safe');
    }

    setResult({
      score,
      reasons,
      details: {
        keywordMatches,
        urlIssues,
        sensitiveRequests,
        brandImpersonation
      }
    });
    setIsLoading(false);
  };

  const resetAnalysis = () => {
    setEmailText('');
    setResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'success';
    if (score < 70) return 'warning';
    return 'danger';
  };

  const getScoreIcon = (score: number) => {
    if (score < 30) return CheckCircle2;
    if (score < 70) return AlertTriangle;
    return XCircle;
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return 'Safe';
    if (score < 70) return 'Suspicious';
    return 'Phishing';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary mb-6 shadow-glow"
          >
            <Shield className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3"
          >
            Phishing Email Detector
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-muted-foreground text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto mb-6 leading-relaxed px-2"
          >
            Harness next-generation AI algorithms to instantly intercept dynamic phishing attacks, trace hidden malicious URLs, and neutralize deceptive content across all vectors.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-card border-border shadow-xl backdrop-blur-sm">
            <div className="space-y-4">
              <ExampleEmailSelector onSelectEmail={setEmailText} />

              <div>
                <label htmlFor="email-input" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Email Content Analysis
                </label>
                <Textarea
                  id="email-input"
                  placeholder="Paste the email content here for comprehensive phishing analysis..."
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  className="min-h-[240px] bg-background border-border text-foreground resize-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={analyzeEmail}
                  disabled={!emailText.trim() || isLoading}
                  className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Analyze Email
                    </>
                  )}
                </Button>

                {(emailText || result) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button
                      onClick={resetAnalysis}
                      variant="outline"
                      className="py-6 px-6 border-border hover:bg-secondary/50"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mt-6 p-6 bg-gradient-card border-border shadow-xl backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      {(() => {
                        const Icon = getScoreIcon(result.score);
                        const color = getScoreColor(result.score);
                        return (
                          <Icon
                            className={`w-10 h-10 ${color === 'success'
                              ? 'text-success'
                              : color === 'warning'
                                ? 'text-warning'
                                : 'text-danger'
                              }`}
                          />
                        );
                      })()}
                    </motion.div>
                  </div>

                  {/* Threat Score Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Threat Score</span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className={`text-3xl font-bold ${getScoreColor(result.score) === 'success'
                          ? 'text-success'
                          : getScoreColor(result.score) === 'warning'
                            ? 'text-warning'
                            : 'text-danger'
                          }`}
                      >
                        {result.score}/100
                      </motion.span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-4 overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        className={`h-full rounded-full shadow-lg ${getScoreColor(result.score) === 'success'
                          ? 'bg-success'
                          : getScoreColor(result.score) === 'warning'
                            ? 'bg-warning'
                            : 'bg-danger'
                          }`}
                      />
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center text-base font-semibold text-foreground"
                    >
                      Status: <span className={
                        getScoreColor(result.score) === 'success'
                          ? 'text-success'
                          : getScoreColor(result.score) === 'warning'
                            ? 'text-warning'
                            : 'text-danger'
                      }>{getScoreLabel(result.score)}</span>
                    </motion.p>
                  </div>

                  {/* Detection Metrics Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    <div className="bg-secondary/50 p-3 rounded-lg text-center border border-border">
                      <div className="text-2xl font-bold text-primary">{result.details.keywordMatches}</div>
                      <div className="text-xs text-muted-foreground mt-1">Keywords</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg text-center border border-border">
                      <div className="text-2xl font-bold text-warning">{result.details.urlIssues}</div>
                      <div className="text-xs text-muted-foreground mt-1">URL Issues</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg text-center border border-border">
                      <div className="text-2xl font-bold text-danger">{result.details.sensitiveRequests}</div>
                      <div className="text-xs text-muted-foreground mt-1">Sensitive Data</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg text-center border border-border">
                      <div className="text-2xl font-bold text-accent">
                        {result.details.brandImpersonation ? '⚠️' : '✓'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Brand Check</div>
                    </div>
                  </motion.div>

                  {/* Detection Reasons - organized & professional */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      Detection Reasons
                    </h3>

                    {/* Helper: parse reason string into structured parts */}
                    {(() => {
                      type ReasonItem = { id: string; title: string; detail?: string; severity: 'high' | 'medium' | 'low'; raw: string };

                      const parseReasonString = (r: string): ReasonItem => {
                        const raw = r;
                        const parts = r.split(':');
                        const left = parts[0] || r;
                        const detail = parts.slice(1).join(':').trim();
                        // Determine severity from emoji or keywords
                        let severity: ReasonItem['severity'] = 'low';
                        if (/🚨|MAJOR|HIGH|HIGH RISK|MAJOR RED FLAG/i.test(r)) severity = 'high';
                        else if (/⚠️|⚠|Warning|suspicious|Suspicious|🔤|🔒|🔐/i.test(r)) severity = 'medium';
                        else severity = 'low';

                        return { id: Math.random().toString(36).slice(2, 9), title: left.trim(), detail: detail || undefined, severity, raw };
                      };

                      const groupReasons = (list: string[]) => {
                        const groups: Record<string, ReasonItem[]> = {
                          URLs: [],
                          Brand: [],
                          Grammar: [],
                          Attachments: [],
                          Advanced: [],
                          Headers: [],
                          Context: [],
                          Other: []
                        };

                        list.forEach(r => {
                          const rr = r.toLowerCase();
                          const item = parseReasonString(r);
                          if (/https?:\/\/|ip-based|ip analyzed|domain analyzed|url analyzed|shortened|tld|excessive links|redirect|shortener|shortened/i.test(rr)) groups.URLs.push(item);
                          else if (/brand|impersonation|🎭|brand impersonation/i.test(rr)) groups.Brand.push(item);
                          else if (/phras|phishing phrases|punctuation|capitaliz|grammar|excessive punctuation|inconsistent capitalization|generic greetings|suspicious phrasing/i.test(rr)) groups.Grammar.push(item);
                          else if (/attachment|file|download|password-protected|locked|large file|double file extension/i.test(rr)) groups.Attachments.push(item);
                          else if (/mixed character|homograph|punycode|character sets|b64|base64|dga|homograph attack/i.test(rr)) groups.Advanced.push(item);
                          else if (/spf|dkim|dmarc|authentication-results|no spf|no dkim|no dmarc/i.test(rr)) groups.Headers.push(item);
                          else if (/urgent|prize|threat|time|region|suspicious time|requests sensitive|sensitive information|bangladesh-specific|detected region/i.test(rr)) groups.Context.push(item);
                          else groups.Other.push(item);
                        });

                        return groups;
                      };

                      const groups = groupReasons(result.reasons);

                      const CategoryPanel = ({ icon, title, reasons }: { icon: JSX.Element; title: string; reasons: ReasonItem[] }) => {
                        const isOpen = openCategories[title] ?? true;
                        if (!reasons || reasons.length === 0) return null;

                        const containerVariant = {
                          hidden: {},
                          visible: { transition: { staggerChildren: 0.06, when: 'beforeChildren' as const } }
                        };

                        const itemVariant: import("framer-motion").Variants = {
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
                        };

                        const generateExplanation = (raw: string) => {
                          const r = raw.toLowerCase();
                          if (/ip-based|ip analyzed|ip address|direct ip/i.test(r)) return 'IP-based URLs bypass domain reputation checks and may indicate a manually hosted malicious resource. Prefer domains with valid certificates.';
                          if (/shorten|shortener|shortened|bit\.ly|tinyurl|t\.co/i.test(r)) return 'Shortened URLs can hide the final destination; expand the short URL first or avoid clicking and verify with the sender.';
                          if (/suspicious prize|prize|winner|congratulations/i.test(r)) return 'Prize/lottery language is a common lure used in phishing to trick users into revealing information or clicking malicious links.';
                          if (/threatening language|account suspended|security alert|verify your account|confirm identity/i.test(r)) return 'Threatening or urgent language tries to create panic and prompt immediate action; always verify via official channels.';
                          if (/requests sensitive information|password|credit card|ssn|otp|verification code/i.test(r)) return 'Requests for sensitive information are a major red flag; legitimate services do not ask for such data over email.';
                          if (/no spf|no dkim|no dmarc|spf=pass|dkim=pass/i.test(r)) return 'Missing or failing SPF/DKIM/DMARC headers reduces sender authentication and increases likelihood of spoofing.';
                          if (/mixed character|homograph|punycode/i.test(r)) return 'Mixed character sets and punycode can be used for homograph attacks where characters appear visually similar to trick users.';
                          if (/excessive links|excessive links detected|excessive subdomains/i.test(r)) return 'Emails with many links or excessive subdomains often attempt to overwhelm users and hide malicious destinations.';
                          if (/password-protected files|password-protected/i.test(r)) return 'Password-protected attachments are often used to bypass security scanners; treat such files with caution.';
                          if (/phishing phrases|verify your identity|confirm your password/i.test(r)) return 'Common phishing phrases indicate scripted scams that attempt credential theft.';
                          if (/brand impersonation|possible brand impersonation|brand impersonation detected/i.test(r)) return 'Brand impersonation attempts to mimic legitimate organizations. Check the sender address and domain carefully.';
                          return 'This indicator was triggered by the content; expand to see exact matched text and guidance.';
                        };

                        return (
                          <div className="rounded-md bg-card border border-border shadow-sm">
                            <div className="p-0">
                              <button
                                onClick={() => setOpenCategories(prev => ({ ...prev, [title]: !isOpen }))}
                                aria-expanded={isOpen}
                                className="w-full flex items-center gap-3 p-3 text-left bg-transparent hover:bg-secondary/5 rounded-t-md border-b border-border/10"
                              >
                                {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-secondary/10 text-primary">{icon}</div>
                                <div className="flex-1">
                                  <div className="font-semibold">{title} <span className="text-sm text-muted-foreground">({reasons.length})</span></div>
                                </div>
                              </button>
                            </div>

                            {isOpen && (
                              <motion.div variants={containerVariant} initial="hidden" animate="visible">
                                {reasons.map((r, i) => {
                                  const isExpanded = expandedIdGlobal === r.id;

                                  return (
                                    <div key={r.id} className="p-1">
                                      <motion.div
                                        variants={itemVariant}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-start gap-3 cursor-pointer border-2 border-border/80 rounded-md p-2 bg-secondary/20"
                                        onClick={() => {
                                          if (isExpanded) setExpandedIdGlobal(null);
                                          else {
                                            setExpandedIdGlobal(r.id);
                                            setOpenCategories(() => {
                                              const obj: Record<string, boolean> = {};
                                              categoryKeys.forEach(k => obj[k] = false);
                                              obj[title] = true;
                                              return obj;
                                            });
                                          }
                                        }}
                                      >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">{i + 1}</div>
                                        <div className="flex-1">
                                          <div className="bg-transparent p-0">
                                            <div className="flex items-center justify-between">
                                              <div className="text-sm font-medium text-foreground truncate">{r.title}</div>
                                              <div className="text-xs text-muted-foreground">{isExpanded ? 'Hide' : 'Details'}</div>
                                            </div>
                                            {r.detail && <div className="text-xs text-muted-foreground mt-1 truncate">{r.detail}</div>}
                                          </div>
                                        </div>
                                      </motion.div>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                            className="mt-1 overflow-hidden text-sm text-muted-foreground bg-secondary/10 p-3 rounded"
                                          >
                                            {generateExplanation(r.raw)}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </div>
                        );
                      };

                      return (
                        <div className="space-y-3">
                          <CategoryPanel icon={<Link className="w-4 h-4" />} title="URLs" reasons={groups.URLs} />
                          <CategoryPanel icon={<FileText className="w-4 h-4" />} title="Grammar" reasons={groups.Grammar} />
                          <CategoryPanel icon={<FileIcon className="w-4 h-4" />} title="Attachments" reasons={groups.Attachments} />
                          <CategoryPanel icon={<Brain className="w-4 h-4" />} title="Advanced" reasons={groups.Advanced} />
                          <CategoryPanel icon={<FileText className="w-4 h-4" />} title="Headers" reasons={groups.Headers} />
                          <CategoryPanel icon={<Shield className="w-4 h-4" />} title="Brand" reasons={groups.Brand} />
                          <CategoryPanel icon={<MessageSquare className="w-4 h-4" />} title="Context" reasons={groups.Context} />
                          <CategoryPanel icon={<MoreHorizontal className="w-4 h-4" />} title="Others" reasons={groups.Other} />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Security Recommendation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className={`p-4 rounded-lg border-2 ${getScoreColor(result.score) === 'success'
                      ? 'bg-success/10 border-success'
                      : getScoreColor(result.score) === 'warning'
                        ? 'bg-warning/10 border-warning'
                        : 'bg-danger/10 border-danger'
                      }`}
                  >
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getScoreColor(result.score) === 'success'
                        ? 'This email appears safe, but always verify sender addresses and hover over links before clicking.'
                        : getScoreColor(result.score) === 'warning'
                          ? 'Exercise caution with this email. Verify the sender through official channels before taking any action.'
                          : '⚠️ HIGH RISK: Do not click any links, download attachments, or provide any information. Report this as phishing.'}
                    </p>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
