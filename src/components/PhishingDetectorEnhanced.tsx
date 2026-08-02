import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, BarChart3, RefreshCw, History, Download, Brain, Copy, Check, TrendingUp, FileText, MessageSquare, ArrowLeftRight, Radar, FileJson, FileSpreadsheet, MoreHorizontal, Upload, File as FileIcon, Link, MapPin, Globe, ChevronDown, ChevronUp, ChevronRight, Sparkles, List, Menu } from 'lucide-react';
import { InputTypeSelector } from './InputTypeSelector';
import type { InputType } from '../types/phishing';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { AnimatedCounter } from './AnimatedCounter';
import { RippleButton } from './RippleButton';
import { AnalysisCardSkeleton } from './AnalysisCardSkeleton';
import { SecurityRadarChart } from './SecurityRadarChart';
import { EmailHeatMap } from './EmailHeatMap';
import { FileHeatMap } from './FileHeatMap';
import { URLHeatMap } from './URLHeatMap';
import { IPHeatMap } from './IPHeatMap';
import { DomainHeatMap } from './DomainHeatMap';
import { AnimatedBarChart } from './AnimatedBarChart';
import { ComparisonMode } from './ComparisonMode';
import { OnboardingTour } from './OnboardingTour';
import { ContextualHelp } from './ContextualHelp';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ExampleEmailSelector } from './ExampleEmailSelector';
import { ExampleUrlSelector } from './ExampleUrlSelector';
import type { ExampleUrl } from '@/data/exampleUrls';
import { ExampleIPSelector } from './ExampleIPSelector';
import { ExampleDomainSelector } from './ExampleDomainSelector';
import { ExampleFileSelector } from './ExampleFileSelector';
import type { ExampleIP } from '@/data/exampleIPs';
import { TipsCarousel } from './TipsCarousel';
import { HistorySidebar } from './HistorySidebar';
import { QuizMode } from './QuizMode';
import { ProgressStepper } from './ProgressStepper';
import { URLHighlighter } from './URLHighlighter';
import { SecurityRecommendation } from './SecurityRecommendation';
import { EmailHeaderParser } from './EmailHeaderParser';
import { ScreenshotAnalyzer } from './ScreenshotAnalyzer';
import { URLContentAnalyzer } from './URLContentAnalyzer';
import { URLScreenshotAnalyzer } from './URLScreenshotAnalyzer';
import { IPScreenshotAnalyzer } from './IPScreenshotAnalyzer';
import { DomainScreenshotAnalyzer } from './DomainScreenshotAnalyzer';
import { AIAssistant } from './AIAssistant';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { PhishingResult, AnalysisHistory, UserStats } from '@/types/phishing';
import { exportToPDF } from '@/utils/pdfExport';
import { exportHistoryToCSV } from '@/utils/csvExport';
import { exportHistoryToJSON, exportResultToJSON } from '@/utils/jsonExport';
import { checkAchievements } from '@/utils/achievementSystem';
import { toast } from 'sonner';

const MAX_ANALYSIS_INPUT_LENGTH = 200_000;
import { AchievementToast } from './AchievementToast';
import confetti from 'canvas-confetti';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import APIKeysModal from './APIKeysModal';
import { Footer } from './Footer';
import { scanPhishingInput } from '@/utils/phishingScoring';

export const PhishingDetectorEnhanced = () => {
  const { history, setHistory, sidebarHistory, setSidebarHistory, stats, setStats, quizOpen, setQuizOpen } = useAnalytics();
  const [inputType, setInputType] = useState<InputType>('email');
  const [emailText, setEmailText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [urlText, setUrlText] = useState('');
  const [ipText, setIpText] = useState('');
  const [domainText, setDomainText] = useState('');
  const [selectedExampleFile, setSelectedExampleFile] = useState<any>(null);
  const [selectedExampleUrl, setSelectedExampleUrl] = useState<ExampleUrl | null>(null);
  const [selectedExampleIP, setSelectedExampleIP] = useState<ExampleIP | null>(null);
  const [selectedExampleDomain, setSelectedExampleDomain] = useState<any>(null);
  const [fileNameText, setFileNameText] = useState('');
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [realtimeScore, setRealtimeScore] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<any[]>([]);
  const [showHeaderParser, setShowHeaderParser] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [showURLScreenshot, setShowURLScreenshot] = useState(false);
  const [showIPScreenshot, setShowIPScreenshot] = useState(false);
  const [showDomainScreenshot, setShowDomainScreenshot] = useState(false);

  const [showAI, setShowAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);

  const [showOnboarding, setShowOnboarding] = useLocalStorage('phishing-onboarding-completed', false);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlContent, setUrlContent] = useState('');
  const [urlAnalysis, setUrlAnalysis] = useState<any>(null);
  const [urlContentAnalysis, setUrlContentAnalysis] = useState('');
  const [urlScreenshotText, setUrlScreenshotText] = useState('');
  const [apiModalOpen, setApiModalOpen] = useState(false);

  // Global expansion state for detection reasons UI (moved to component scope to satisfy Hooks rules)
  const [expandedIdGlobal, setExpandedIdGlobal] = useState<string | null>(null);
  const categoryKeys = ['URLs', 'Brand', 'Content', 'Attachments', 'Advanced', 'Headers', 'Others'];
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    categoryKeys.forEach(k => init[k] = true);
    return init;
  });


  useEffect(() => {
    // Force main page scroll bar to always be visible
    const ensureScrollbarVisible = () => {
      document.body.style.overflowY = 'scroll';
      document.documentElement.style.overflowY = 'scroll';
    };

    // Set immediately
    ensureScrollbarVisible();

    // Set again after a short delay to override any conflicting styles
    const timeoutId = setTimeout(ensureScrollbarVisible, 100);

    // Use MutationObserver to watch for changes to body styles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          ensureScrollbarVisible();
        }
      });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      document.body.style.overflowY = '';
      document.documentElement.style.overflowY = '';
    };
  }, []);

  useEffect(() => {
    const inputText = getCurrentInputText();
    if (!inputText.trim()) {
      setRealtimeScore(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      const quickScore = scanPhishingInput(inputText, inputType, file?.name || fileNameText).score;
      setRealtimeScore(quickScore);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [emailText, urlText, ipText, domainText, inputType]);

  // Close comparison modal when input type changes
  useEffect(() => {
    setShowComparison(false);
  }, [inputType]);

  // Handle URL parameters for opening modals
  useEffect(() => {
    const handleOpenHistory = () => setHistoryOpen(true);
    const handleOpenQuiz = () => setQuizOpen(true);
    const handleLoadHistoryItem = (event: CustomEvent) => {
      const item = event.detail;
      switch (item.inputType) {
        case 'email':
          setEmailText(item.result.emailPreview || '');
          break;
        case 'url':
          setUrlText(item.inputContent);
          break;
        case 'ip':
          setIpText(item.inputContent);
          break;
        case 'domain':
          setDomainText(item.inputContent);
          break;
        case 'file':
          // For files, we can't restore the actual file object, but we can show the name
          setFile(null); // Reset file since we can't restore it
          break;
      }
      setInputType(item.inputType);
      setResult(item.result);
      setHistoryOpen(false); // Close history sidebar after loading
    };

    window.addEventListener('openHistory', handleOpenHistory);
    window.addEventListener('openQuiz', handleOpenQuiz);
    window.addEventListener('loadHistoryItem', handleLoadHistoryItem as EventListener);

    return () => {
      window.removeEventListener('openHistory', handleOpenHistory);
      window.removeEventListener('openQuiz', handleOpenQuiz);
      window.removeEventListener('loadHistoryItem', handleLoadHistoryItem as EventListener);
    };
  }, []);

  const getCurrentInputText = () => {
    switch (inputType) {
      case 'email': return emailText;
      case 'url': return urlText;
      case 'ip': return ipText;
      case 'domain': return domainText;
      case 'file': return fileNameText || file?.name || '';
      default: return '';
    }
  };

  const analyzeInput = async () => {
    const inputText = getCurrentInputText();
    if (!inputText.trim() && inputType !== 'file') return;
    if (inputType === 'file' && !file && !fileNameText.trim()) return;

    return await performAnalysis(inputText);
  };

  const performAnalysis = async (text: string): Promise<PhishingResult> => {
    if (!text.trim()) return {} as PhishingResult;
    if (text.length > MAX_ANALYSIS_INPUT_LENGTH) {
      toast.error(`Input is too large. Please keep it under ${MAX_ANALYSIS_INPUT_LENGTH.toLocaleString()} characters.`);
      return {} as PhishingResult;
    }

    setIsLoading(true);
    setAnalysisSteps([
      { label: 'Parsing', status: 'active' },
      { label: 'Analyzing', status: 'pending' },
      { label: 'Scoring', status: 'pending' },
      { label: 'Complete', status: 'pending' }
    ]);

    const reasons: string[] = [];
    let score = 0;
    let keywordMatches = 0;
    let urlIssues = 0;
    let sensitiveRequests = 0;
    let brandImpersonation = false;

    interface UrlAnalysisResult {
      url: string;
      generalOverview: string;
      suspicionIndicators: string[];
      technicalDetails: {
        protocol: string;
        domainType: string;
        tld: string;
        subdomainCount: number;
        urlLength: number;
        hasParameters: boolean;
        port: number;
      };
      threatReasoning: string;
      verdict: string;
      recommendation: string;
      analysisReport: {
        domain: string;
        ipAddress: string;
        sslCertificate: string;
        redirectChain: string;
        blacklistCheck: string;
        whoisInfo: string;
        urlLength: number;
        encodingDetected: string;
        subdomainCount: number;
        parameterCount: number;
      };
    }

    interface IndividualItemResult {
      item: string;
      score: number;
      verdict: string;
      riskLevel: 'safe' | 'suspicious' | 'phishing';
      reasons: string[];
    }

    interface AnalysisMetadata {
      urlAnalysis?: UrlAnalysisResult[];
      ipAnalysis?: any[];
      domainAnalysis?: any[];
      fileAnalysis?: any[];
      individualResults?: IndividualItemResult[];
    }

    let metadata: AnalysisMetadata = {
      individualResults: [] as IndividualItemResult[]
    };

    // Initialize categorized reasons
    const categorizedReasons = {
      urls: [] as string[],
      brand: [] as string[],
      grammar: [] as string[],
      content: [] as string[],
      attachments: [] as string[],
      advanced: [] as string[],
      headers: [] as string[],
      context: [] as string[],
      other: [] as string[]
    };

    // Shared deterministic signals keep the different input analyzers
    // consistent while the detailed branches below continue to build reports.
    const sharedScan = scanPhishingInput(text, inputType, file?.name || fileNameText);
    const sharedBaseScore = sharedScan.score;
    reasons.push(...sharedScan.reasons);
    Object.entries(sharedScan.categorizedReasons).forEach(([category, messages]) => {
      const target = categorizedReasons[category as keyof typeof categorizedReasons];
      if (target && Array.isArray(messages)) target.push(...messages);
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'complete' } : i === 1 ? { ...s, status: 'active' } : s));

      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisSteps(prev => prev.map((s, i) => i <= 1 ? { ...s, status: 'complete' } : i === 2 ? { ...s, status: 'active' } : s));

      await new Promise(resolve => setTimeout(resolve, 600));

      // Different analysis logic based on input type
      switch (inputType) {
        case 'email': {
          // Existing email analysis logic
          const urgentKeywords = ['urgent', 'immediately', 'action required', 'verify now', 'within 24 hours', 'expires today', 'suspended', 'locked', 'act now', 'immediate', 'now', 'today', '24 hours', '12 hours', '6 hours'];
          const prizeKeywords = ['winner', 'prize', 'congratulations', 'lottery', 'inheritance', 'millions', 'selected', 'claim', 'free', 'gift', 'bonus', 'reward'];
          const threatKeywords = ['account suspended', 'verify account', 'unusual activity', 'security alert', 'confirm identity', 'unauthorized access', 'blocked', 'locked', 'suspended', 'alert'];
          const actionKeywords = ['click here', 'download now', 'open attachment', 'update payment', 'confirm password', 'verify', 'update', 'confirm'];

          const foundUrgent = urgentKeywords.filter(kw => text.toLowerCase().includes(kw));
          const foundPrize = prizeKeywords.filter(kw => text.toLowerCase().includes(kw));
          const foundThreat = threatKeywords.filter(kw => text.toLowerCase().includes(kw));
          const foundAction = actionKeywords.filter(kw => text.toLowerCase().includes(kw));

          if (foundUrgent.length > 0) {
            score += foundUrgent.length * 10; // Reduced from 15 to 10 for better calibration
            keywordMatches += foundUrgent.length;
            categorizedReasons.context.push(`⚠️ Creates false urgency: "${foundUrgent.join('", "')}"`);
          }

          if (foundPrize.length > 0) {
            score += foundPrize.length * 8; // Reduced from 20 to 8 for better calibration
            keywordMatches += foundPrize.length;
            categorizedReasons.context.push(`🎰 Suspicious prize claims: "${foundPrize.join('", "')}"`);
          }

          if (foundThreat.length > 0) {
            score += foundThreat.length * 12; // Reduced from 20 to 12 for better calibration
            keywordMatches += foundThreat.length;
            categorizedReasons.context.push(`🚨 Threatening language: "${foundThreat.join('", "')}"`);
          }

          if (foundAction.length > 0) {
            score += foundAction.length * 15; // Reduced from 18 to 15 for better calibration
            keywordMatches += foundAction.length;
            categorizedReasons.context.push(`🔗 Suspicious call-to-action: "${foundAction.join('", "')}"`);
          }

          const ipUrlPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
          const ipUrls = text.match(ipUrlPattern);
          if (ipUrls) {
            score += 45; // Increased from 35 to 45 for better detection
            urlIssues += ipUrls.length;
            categorizedReasons.urls.push(`🌐 IP-based URLs detected (${ipUrls.length} found)`);
          }
          // Attachments checks
          const passwordProtectedFiles = /password.?protected|locked|protected file|encrypted file|secure attachment/i.test(text);
          if (passwordProtectedFiles) {
            score += 25; // Increased from 20 to 25
            categorizedReasons.attachments.push(`🔒 Password-protected files mentioned: password-protected, locked, protected file`);
          }

          // Advanced checks
          const mixedCharacterSets = /[\u0400-\u04FF\u0600-\u06FF\u3040-\u309F\u30A0-\u30FF]/g.test(text);
          if (mixedCharacterSets) {
            score += 20; // Increased from 15 to 20
            categorizedReasons.advanced.push(`🌍 Mixed character sets detected: 1 instances`);
          }

          // Headers checks (simulated for email analysis)
          // Only check these if email headers are explicitly present
          const hasEmailHeaders = text.toLowerCase().includes('received:') || text.toLowerCase().includes('authentication-results');
          if (hasEmailHeaders) {
            const noSPF = !text.toLowerCase().includes('spf=pass');
            if (noSPF) {
              score += 15;
              categorizedReasons.headers.push(`⚠️ No SPF authentication found`);
            }

            const noDKIM = !text.toLowerCase().includes('dkim=pass');
            if (noDKIM) {
              score += 15;
              categorizedReasons.headers.push(`⚠️ No DKIM signature found`);
            }

            const noDMARC = !text.toLowerCase().includes('dmarc=pass');
            if (noDMARC) {
              score += 15;
              categorizedReasons.headers.push(`⚠️ No DMARC results found`);
            }
          }

          // Context checks
          const suspiciousTime = /late night|early morning|unusual time|midnight|dawn/i.test(text);
          if (suspiciousTime) {
            score += 8; // Increased from 5 to 8
            categorizedReasons.context.push(`🕐 Email sent at suspicious time`);
          }

          const detectedRegion = /india|indian|inr|rupee|bangladesh|bangladeshi|bdt|taka|dhaka|chittagong/i.test(text);
          if (detectedRegion) {
            score += 8; // Increased from 5 to 8
            categorizedReasons.context.push(`📍 Detected region: BANGLADESH`);
          }

          // Additional context checks for Bangladesh-specific scams
          const bangladeshScams = /kyc|nid|tin|mobile banking|bkash|nagad|rocket|upay|sonali bank|janata bank|agrani bank|dutch bangla bank|brac bank|eastern bank|prime bank|standard chartered|hsbc|citibank|dbbl|grameenphone|banglalink|robi|airtel|teletalk|daraz|pickaboo|evaly|chaldal|shohoz|pathao|uber|careem|bdtaxi/i.test(text);
          if (bangladeshScams) {
            score += 15; // Increased from 12 to 15 for better detection
            categorizedReasons.context.push(`🇧🇩 Bangladesh-specific services mentioned (potential targeted scam)`);
          }

          // --- Enhanced email-specific heuristics: URL extraction, brand, grammar, attachments, headers, obfuscation ---
          // Extract URLs (http/https, mailto, javascript:, data:) and bare-looking domains
          const urlExtractRegex = /((https?:\/\/[\w\-\.:%@\/?#=+&~,]+)|(mailto:[\w@.\-+%]+)|(javascript:[^\s]+)|(data:[^\s]+))/gi;
          const foundUrls = Array.from(new Set((text.match(urlExtractRegex) || []).map(u => u.trim())));
          for (const u of foundUrls) {
            // Normalize
            const uLower = u.toLowerCase();
            if (/^javascript:/.test(uLower) || uLower.startsWith('data:')) {
              score += 40;
              categorizedReasons.advanced.push(`⚠️ JavaScript/data URI in email content: ${u}`);
            }

            if (uLower.startsWith('mailto:')) {
              categorizedReasons.context.push(`✉️ Mailto link present: ${u.replace(/^mailto:/, '')}`);
            }

            // HTTP (no TLS)
            if (uLower.startsWith('http://')) {
              score += 20;
              categorizedReasons.urls.push(`🔓 HTTP URL (no TLS) found: ${u}`);
            }

            // IP-based URL
            if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u)) {
              score += 40;
              categorizedReasons.urls.push(`🌐 IP-based URL detected in email: ${u}`);
            }

            // Shorteners
            const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly', 'shrtco.de'];
            if (shorteners.some(s => uLower.includes(s))) {
              score += 30;
              categorizedReasons.urls.push(`🔗 Shortened URL used: ${u}`);
            }

            // Suspicious parameters (base64-like)
            if (/\?[A-Za-z0-9+/=]{20,}/.test(u)) {
              score += 18;
              categorizedReasons.advanced.push(`🔒 Obfuscated/base64 parameters in URL: ${u}`);
            }

            // Suspicious TLDs
            const suspiciousEmailTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.online', '.site'];
            for (const tld of suspiciousEmailTlds) {
              if (uLower.includes(tld)) {
                score += 24;
                categorizedReasons.urls.push(`⚠️ Suspicious TLD in link: ${tld} (link: ${u})`);
                break;
              }
            }

            // Brand impersonation inside URLs or surrounding text
            const brands = [
              'paypal', 'amazon', 'microsoft', 'apple', 'google', 'netflix', 'bank', 'banking', 'paytm', 'aadhaar', 'uidai', 'gmail', 'outlook', 'hotmail',
              'bkash', 'nagad', 'rocket', 'daraz', 'pathao', 'shohoz', 'chaldal', 'sonali', 'brac', 'dbbl', 'dutch bangla', 'city bank', 'janata bank', 'islami bank', 'robi', 'banglalink'
            ];
            for (const b of brands) {
              if (uLower.includes(b) || text.toLowerCase().includes(b + ' account') || text.toLowerCase().includes(b + ' verification')) {
                // If the visible URL doesn't clearly point to the official domain, flag
                if (!uLower.includes(`${b}.com`) && !uLower.includes(`${b}.org`) && !uLower.includes(`${b}.net`)) {
                  score += 35;
                  categorizedReasons.brand.push(`🎭 Brand impersonation suspected around: ${b}`);
                  break;
                }
              }
            }
          }

          // Grammar & formatting heuristics
          const exclamationCount = (text.match(/!/g) || []).length;
          if (exclamationCount >= 3) {
            score += 8;
            categorizedReasons.grammar.push(`❗ Excessive exclamation marks detected (${exclamationCount})`);
          }

          const allCapsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).length;
          if (allCapsWords >= 3) {
            score += 10;
            categorizedReasons.grammar.push(`🔠 Excessive ALL CAPS words detected (${allCapsWords})`);
          }

          const repeatedPunctuation = /([!?.]){2,}/.test(text);
          if (repeatedPunctuation) {
            score += 6;
            categorizedReasons.grammar.push(`❗ Repeated punctuation detected`);
          }

          // Generic greetings and lack of personalization
          const genericGreeting = /dear (customer|user|client|sir|madam)|hello dear|dear sir|dear madam/i.test(text);
          if (genericGreeting) {
            score += 10;
            categorizedReasons.context.push(`👤 Generic greeting detected (no personalization)`);
          }

          // Attachment mentions and filenames
          const fileMentionRegex = /\b([\w\- ]+\.(exe|scr|zip|rar|7z|iso|img|js|vbs|docm|xlsm|pptm|pdf|docx|xlsx|pptx))\b/gi;
          const fileMatches = Array.from(new Set((text.match(fileMentionRegex) || []).map(s => s.trim())));
          if (fileMatches.length > 0) {
            for (const f of fileMatches) {
              const ext = f.substring(f.lastIndexOf('.'));
              if (/\.(exe|scr|js|vbs)$/i.test(ext)) {
                score += 40;
                categorizedReasons.attachments.push(`⚠️ Dangerous attachment filename referenced: ${f}`);
              } else if (/\.(docm|xlsm|pptm)$/i.test(ext)) {
                score += 35;
                categorizedReasons.attachments.push(`⚠️ Macro-enabled Office file referenced: ${f}`);
              } else {
                score += 6;
                categorizedReasons.attachments.push(`📎 Attachment mentioned: ${f}`);
              }
            }
          }

          // Password-protected attachment mention
          if (/password.?protected|protected file|encrypted file|password:? \w+/i.test(text)) {
            score += 18;
            categorizedReasons.attachments.push(`🔒 Password-protected attachment mentioned`);
          }

          // Header-like clues (From:, Reply-To:, Return-Path:, Received:)
          const fromMatch = text.match(/from:\s*([^\n\r]+)/i);
          const replyToMatch = text.match(/reply-to:\s*([^\n\r]+)/i);
          if (fromMatch) {
            const fromVal = fromMatch[1];
            if (replyToMatch) {
              const replyVal = replyToMatch[1];
              if (!replyVal.includes('@') || (fromVal && replyVal && replyVal.split('@')[1] !== fromVal.split('@')[1])) {
                score += 18;
                categorizedReasons.headers.push(`⚠️ Sender/Reply-To mismatch or suspicious header: From(${fromVal}) Reply-To(${replyVal})`);
              }
            }
          }

          // Obfuscation heuristics: many dots, unicode homoglyphs, zero/oh swaps
          if (/(\.|\-|_){6,}/.test(text)) {
            score += 8;
            categorizedReasons.advanced.push(`🔎 Excessive separators/dots detected (possible obfuscation)`);
          }

          if (/[\u0400-\u04FF\u0370-\u03FF]/.test(text)) {
            score += 18;
            categorizedReasons.advanced.push(`🌍 Non-Latin characters present (possible homograph / internationalized text)`);
          }

          // Social engineering patterns: urgency + verification + link
          if ((foundUrls.length > 0 || text.toLowerCase().includes('link')) && (foundUrgent.length > 0 || foundAction.length > 0 || foundThreat.length > 0)) {
            score += 20;
            categorizedReasons.context.push(`🔗 Urgent request combined with link(s) — classic phishing pattern`);
          }
          break;
        }

        case 'file': {
          // Basic file analysis
          const fileAnalysisResults: any[] = [];
          if (file) {
            const fileName = file.name.toLowerCase();
            const fileType = file.type.toLowerCase();

            // Check for suspicious file extensions
            const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar'];
            if (suspiciousExtensions.some(ext => fileName.endsWith(ext))) {
              score += 40;
              keywordMatches += 1; // Count as keyword match for suspicious extension
              const ext = fileName.slice(fileName.lastIndexOf('.'));
              reasons.push(`⚠️ Suspicious file extension detected: ${ext}`);
              categorizedReasons.attachments.push(`⚠️ Suspicious file extension: ${ext}`);
              fileAnalysisResults.push({ file: file.name, issue: 'Suspicious extension', detail: ext });
            }

            // Check file size (very large files might be suspicious)
            if (file.size > 10 * 1024 * 1024) { // 10MB
              score += 15;
              urlIssues += 1; // Count as URL/file issue
              const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
              reasons.push(`📁 Large file size may indicate malware (${sizeMB} MB)`);
              categorizedReasons.attachments.push(`📁 Large file size: ${sizeMB} MB`);
              fileAnalysisResults.push({ file: file.name, issue: 'Large file size', detail: `${sizeMB} MB` });
            }

            // Check for double extensions
            if (fileName.split('.').length > 2) {
              score += 25;
              keywordMatches += 1; // Count as keyword match for double extension
              reasons.push(`🎭 Double file extension detected: ${file.name}`);
              categorizedReasons.advanced.push(`🎭 Double extension detected (masquerading): ${file.name}`);
              fileAnalysisResults.push({ file: file.name, issue: 'Double extension', detail: file.name });
            }

            reasons.push(`📄 File analyzed: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
            fileAnalysisResults.push({ file: file.name, sizeKB: (file.size / 1024).toFixed(1) });

            // Additional file heuristics: macro-enabled Office files, archives, disk images, suspicious MIME types
            if (/\.(docm|xlsm|pptm)$/i.test(fileName)) {
              score += 40;
              categorizedReasons.attachments.push(`⚠️ Macro-enabled Office file detected: ${fileName}`);
              fileAnalysisResults.push({ file: file.name, issue: 'Macro-enabled Office document' });
              reasons.push(`⚠️ Macro-enabled Office file: ${fileName}`);
            }

            if (fileType.includes('zip') || /\.(zip|7z|rar|tar|gz)$/i.test(fileName)) {
              score += 18;
              categorizedReasons.attachments.push(`🗜️ Archive file may contain executables: ${fileName}`);
              fileAnalysisResults.push({ file: file.name, issue: 'Archive container' });
            }

            if (/\.(iso|img|dmg)$/i.test(fileName)) {
              score += 20;
              categorizedReasons.attachments.push(`🖴 Disk image detected: ${fileName}`);
              fileAnalysisResults.push({ file: file.name, issue: 'Disk image' });
            }

            if (/application\/(x-msdownload|x-msdos-program|x-sh|javascript)/i.test(fileType)) {
              score += 35;
              categorizedReasons.attachments.push(`⚠️ Suspicious executable MIME type: ${fileType || fileName}`);
              fileAnalysisResults.push({ file: file.name, issue: 'Suspicious MIME type' });
            }
          } else if (text.trim()) {
            // If no file but text provided, analyze the text
            const suspiciousPatterns = ['malware', 'virus', 'trojan', 'ransomware', 'spyware'];
            const foundSuspicious = suspiciousPatterns.filter(pattern => text.toLowerCase().includes(pattern));
            if (foundSuspicious.length > 0) {
              score += foundSuspicious.length * 20;
              keywordMatches += foundSuspicious.length;
              reasons.push(`🚨 Suspicious content detected: ${foundSuspicious.join(', ')}`);
            }
          }
          break;
        }

        case 'url': {
          // Enhanced URL analysis with structured output
          const urlLines = text.split('\n').filter(line => line.trim());
          const urlAnalysisResults: UrlAnalysisResult[] = [];

          // Whitelist of legitimate/safe domains
          const safeDomainsWhitelist = ['google.com', 'github.com', 'github.io', 'amazon.com', 'amazon.com.bd', 'microsoft.com', 'apple.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'gmail.com', 'outlook.com', 'slack.com', 'discord.com', 'wikipedia.org', 'stackoverflow.com', 'reddit.com', 'quora.com', 'medium.com', 'dev.to', 'hashnode.com', 'npm.org', 'pypi.org', 'rubygems.org', 'crates.io', 'nuget.org', 'maven.org', 'docs.example.com'];

          for (const url of urlLines) {
            let itemScore = 0;
            const itemReasons: string[] = [];
            const urlLower = url.toLowerCase();
            const urlAnalysis: UrlAnalysisResult = {
              url: url,
              generalOverview: '',
              suspicionIndicators: [],
              technicalDetails: {
                protocol: '',
                domainType: '',
                tld: '',
                subdomainCount: 0,
                urlLength: 0,
                hasParameters: false,
                port: 0
              },
              threatReasoning: '',
              verdict: '',
              recommendation: '',
              analysisReport: {
                domain: '',
                ipAddress: '',
                sslCertificate: '',
                redirectChain: '',
                blacklistCheck: '',
                whoisInfo: '',
                urlLength: 0,
                encodingDetected: '',
                subdomainCount: 0,
                parameterCount: 0
              }
            };

            // Extract domain and technical details
            const domainMatch = url.match(/https?:\/\/([^\/]+)/);
            const domain = domainMatch ? domainMatch[1] : url;
            const protocol = url.startsWith('https://') ? 'HTTPS' : 'HTTP';
            const tld = domain.substring(domain.lastIndexOf('.'));
            const subdomainCount = (domain.match(/\./g) || []).length - 1;

            const normalizedHost = domain.replace(/:\d+$/, '').toLowerCase().replace(/^www\./, '');
            const isWhitelisted = safeDomainsWhitelist.some(safeDomain =>
              normalizedHost === safeDomain || normalizedHost.endsWith(`.${safeDomain}`)
            );

            if (urlLower.includes('paypal') || urlLower.includes('login') || urlLower.includes('verify')) {
              urlAnalysis.generalOverview = 'This URL appears to be related to account verification or login services, potentially impersonating legitimate financial or service providers.';
            } else if (urlLower.includes('amazon') || urlLower.includes('microsoft') || urlLower.includes('apple') || urlLower.includes('google')) {
              urlAnalysis.generalOverview = 'This URL claims to represent a major technology or e-commerce company, possibly for account management or service notifications.';
            } else if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
              urlAnalysis.generalOverview = 'This is an IP-based URL that bypasses traditional domain name resolution, commonly used to evade detection.';
            } else {
              urlAnalysis.generalOverview = 'This URL appears to be a web address that may contain suspicious or potentially harmful content.';
            }

            urlAnalysis.technicalDetails = {
              protocol: protocol,
              domainType: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain) ? 'IP Address' : 'FQDN',
              tld: tld,
              subdomainCount: subdomainCount,
              urlLength: url.length,
              hasParameters: url.includes('?'),
              port: url.match(/:(\d+)/) ? parseInt(url.match(/:(\d+)/)![1]) : (protocol === 'HTTPS' ? 443 : 80)
            };

            if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
              itemScore += 40;
              urlIssues += 1;
              urlAnalysis.suspicionIndicators.push('Direct IP address usage instead of domain name');
              itemReasons.push('🌐 IP-based URL detected');
              categorizedReasons.urls.push(`🌐 IP-based URL detected: ${url}`);
            }

            if (url.startsWith('http://') && !url.startsWith('https://')) {
              itemScore += 25;
              urlIssues += 1;
              urlAnalysis.suspicionIndicators.push('Uses unencrypted HTTP protocol');
              itemReasons.push('⚠️ Unencrypted HTTP protocol');
              categorizedReasons.headers.push(`⚠️ Unencrypted HTTP protocol: ${url}`);
            }

            const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 'is.gd', 'buff.ly', 'adf.ly', 'tiny.cc', 'cli.gs', 'qr.net', '1url.com', 'tweez.me', 'v.gd', 'tr.im', 'lnkd.in', 'db.tt', 'qr.ae', 'adfoc.us', 'cur.lv', 'tiny.pl', 'prettylinkpro.com', 'shrinkonce.com', 'shrtfly.com', 'shortquik.com', 'fastt.ly', 'short.pe', 'vzturl.com', 'cutt.ly', 'shorturl.at', 'tiny.one', 'shorte.st', 'short.io', 'rebrand.ly', 'bl.ink', 'linktree.com', 'bit.do'];
            if (shorteners.some(shortener => urlLower.includes(shortener))) {
              itemScore += 35;
              urlIssues += 1;
              urlAnalysis.suspicionIndicators.push('URL shortening service detected');
              itemReasons.push('🔗 Shortened URL detected');
              categorizedReasons.urls.push(`🔗 Shortened URL detected: ${url}`);
            }

            const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.online', '.site', '.website', '.space', '.fun', '.tech', '.click', '.link', '.buzz', '.work', '.party', '.review', '.science', '.business', '.network', '.company', '.email', '.download', '.trade', '.bid', '.webcam', '.loan', '.win', '.date', '.faith', '.racing', '.review', '.science', '.accountant', '.cricket', '.football', '.golf', '.tennis', '.casino', '.poker', '.bet', '.blackjack', '.roulette', '.porn', '.sex', '.adult', '.xxx'];
            if (suspiciousTlds.some(tld => urlLower.endsWith(tld))) {
              itemScore += 28;
              urlIssues += 1;
              const foundTld = suspiciousTlds.find(tld => urlLower.endsWith(tld));
              urlAnalysis.suspicionIndicators.push(`Free or suspicious TLD: ${foundTld}`);
              itemReasons.push(`⚠️ Suspicious TLD: ${foundTld}`);
              categorizedReasons.urls.push(`⚠️ Suspicious TLD detected for: ${url}`);
            }

            const portMatch = url.match(/:(\d+)/);
            if (portMatch) {
              const port = parseInt(portMatch[1]);
              if (port !== 80 && port !== 443 && port !== 8080 && port !== 8443) {
                itemScore += 15;
                urlIssues += 1;
                urlAnalysis.suspicionIndicators.push(`Non-standard port usage: ${port}`);
                itemReasons.push(`🔌 Non-standard port: ${port}`);
                categorizedReasons.advanced.push(`🔌 Non-standard port detected: ${port} in ${url}`);
              }
            }

            if (url.includes('?')) {
              const sensitiveParams = ['login', 'password', 'verify', 'account', 'security', 'bank', 'paypal', 'amazon', 'credit', 'card', 'ssn', 'social', 'security', 'pin', 'cvv', 'otp', 'token', 'auth', 'session', 'redirect', 'return', 'callback'];
              const foundParams = sensitiveParams.filter(param => urlLower.includes(param));
              if (foundParams.length > 0) {
                itemScore += foundParams.length * 12;
                sensitiveRequests += foundParams.length;
                urlAnalysis.suspicionIndicators.push(`Sensitive parameters: ${foundParams.join(', ')}`);
                itemReasons.push(`🔐 Sensitive parameters detected`);
                categorizedReasons.context.push(`🔐 Sensitive parameters in ${url}: ${foundParams.join(', ')}`);
              }

              const paramMatch = url.match(/\?([^#]*)/);
              if (paramMatch) {
                const params = paramMatch[1];
                if (/[A-Za-z0-9+/=]{20,}/.test(params)) {
                  itemScore += 18;
                  urlIssues += 1;
                  urlAnalysis.suspicionIndicators.push('Base64-encoded parameters');
                  itemReasons.push('🔒 Base64 parameters (obfuscation)');
                  categorizedReasons.advanced.push(`🔒 Base64-encoded parameters in ${url}`);
                }
              }
            }

            const suspiciousUrlKeywords = ['login', 'password', 'verify', 'account', 'security', 'bank', 'paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'instagram', 'netflix', 'update', 'confirm', 'validate', 'authenticate', 'secure', 'safe', 'trusted', 'official', 'support', 'help', 'service', 'admin', 'root', 'system', 'alert', 'warning', 'error', 'failed', 'suspended', 'locked', 'blocked', 'disabled', 'urgent', 'immediate', 'action', 'required', 'click', 'download', 'open', 'attachment', 'file', 'exe', 'zip', 'rar', 'pdf', 'doc', 'xls', 'ppt', 'free', 'prize', 'winner', 'lottery', 'claim', 'gift', 'bonus', 'reward', 'cash', 'money', 'bitcoin', 'crypto', 'wallet', 'investment', 'trading', 'forex', 'binary', 'options', 'scam', 'fraud', 'phish', 'hack', 'virus', 'malware', 'trojan', 'ransomware', 'spyware'];
            if (!isWhitelisted) {
              const foundUrlKeywords = suspiciousUrlKeywords.filter(kw => urlLower.includes(kw));
              if (foundUrlKeywords.length > 0) {
                itemScore += foundUrlKeywords.length * 15;
                keywordMatches += foundUrlKeywords.length;
                urlAnalysis.suspicionIndicators.push(`Keywords: ${foundUrlKeywords.slice(0, 3).join(', ')}`);
                itemReasons.push(`⚠️ Suspicious keywords`);
                categorizedReasons.context.push(`⚠️ Suspicious keywords in ${url}`);
              }
            }

            if (urlLower.includes('redirect') || urlLower.includes('return') || urlLower.includes('callback') || urlLower.includes('next')) {
              itemScore += 10;
              urlIssues += 1;
              itemReasons.push('🔄 Potential redirect chain');
              categorizedReasons.advanced.push(`🔄 URL redirect chain in ${url}`);
            }

            if (subdomainCount > 3) {
              itemScore += 12;
              urlIssues += 1;
              itemReasons.push(`🌐 Too many subdomains (${subdomainCount})`);
              categorizedReasons.urls.push(`🌐 Excessive subdomains in ${url}`);
            }

            const numberCountInDomain = (domain.match(/\d/g) || []).length;
            if (numberCountInDomain > 3) {
              itemScore += 15;
              itemReasons.push('🔢 High digit count in domain');
            }

            const brandsList = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'instagram', 'netflix', 'bank', 'twitter', 'linkedin', 'youtube', 'whatsapp', 'telegram', 'skype', 'zoom', 'slack', 'discord', 'ebay', 'alibaba', 'aliexpress', 'walmart', 'target', 'bestbuy', 'costco', 'home depot', 'lowes', 'ikea', 'nordstrom', 'macys', 'kohls', 'jcpenney', 'sears', 'kmart', 'overstock', 'wayfair', 'etsy', 'craigslist', 'indeed', 'monster', 'glassdoor', 'ziprecruiter', 'dice', 'careerbuilder', 'snagajob', 'bkash', 'nagad', 'rocket', 'daraz', 'pathao', 'shohoz', 'chaldal', 'sonali', 'brac', 'dutch bangla', 'dbbl', 'city bank', 'janata bank', 'islami bank', 'robi', 'banglalink'];
            if (!isWhitelisted) {
              for (const brand of brandsList) {
                if (urlLower.includes(brand) && !urlLower.includes(`${brand}.com`) && !urlLower.includes(`${brand}.org`) && !urlLower.includes(`${brand}.net`) && !urlLower.includes(`${brand}.edu`)) {
                  itemScore += 35;
                  brandImpersonation = true;
                  itemReasons.push(`🎭 Brand impersonation: ${brand}`);
                  categorizedReasons.brand.push(`🎭 Brand impersonation detected for: ${brand} in ${url}`);
                  break;
                }
              }
            }

            if (itemScore >= 70) urlAnalysis.verdict = '🚨 Phishing URL';
            else if (itemScore >= 30) urlAnalysis.verdict = '⚠️ Suspicious URL';
            else urlAnalysis.verdict = '✅ Safe URL';

            urlAnalysisResults.push(urlAnalysis);
            metadata.individualResults?.push({
              item: url,
              score: Math.min(itemScore, 100),
              verdict: urlAnalysis.verdict,
              riskLevel: itemScore < 30 ? 'safe' : itemScore < 70 ? 'suspicious' : 'phishing',
              reasons: itemReasons.length > 0 ? itemReasons : ['No immediate red flags detected']
            });

            // Update main score if this item is more dangerous
            if (itemScore > score) score = itemScore;
            reasons.push(`${urlAnalysis.verdict}: ${url}`);
          }

          if (urlAnalysisResults.length > 0) metadata.urlAnalysis = urlAnalysisResults;
          break;
        }

        case 'ip': {
          // Enhanced IP analysis
          const ipAnalysisResultsList: any[] = [];
          const ipLines = text.split('\n').filter(line => line.trim());

          // Whitelist of legitimate/safe IPs
          const safeIPWhitelist = ['8.8.8.8', '1.1.1.1', '208.67.222.222', '140.82.121.4'];

          for (const ip of ipLines) {
            let itemScore = 0;
            const itemReasons: string[] = [];
            const ipTrimmed = ip.trim();

            // Check if IP is on whitelist first
            if (safeIPWhitelist.includes(ipTrimmed)) {
              metadata.individualResults?.push({
                item: ipTrimmed,
                score: 0,
                verdict: '✅ Legitimate IP',
                riskLevel: 'safe',
                reasons: ['Well-known public service']
              });
              reasons.push(`✅ Legitimate IP (${ipTrimmed}): Well-known public service`);
              continue;
            }

            // Basic IP validation
            const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
            if (!ipRegex.test(ipTrimmed)) {
              reasons.push(`❌ Invalid IP format: ${ipTrimmed}`);
              continue;
            }

            const parts = ipTrimmed.split('.').map(Number);

            // Check for invalid IP ranges
            if (parts.some(p => p < 0 || p > 255)) {
              reasons.push(`❌ Invalid IP range: ${ipTrimmed}`);
              continue;
            }

            // Private IPs (RFC 1918)
            if ((parts[0] === 10) ||
              (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
              (parts[0] === 192 && parts[1] === 168) ||
              (parts[0] === 169 && parts[1] === 254)) {
              itemScore += 35;
              urlIssues += 1;
              itemReasons.push('🏠 Private IP address');
              categorizedReasons.advanced.push(`🏠 Private IP detected (RFC 1918): ${ipTrimmed}`);
            }

            // Loopback addresses
            if (parts[0] === 127) {
              itemScore += 15;
              urlIssues += 1;
              itemReasons.push('🔄 Loopback IP address');
              categorizedReasons.advanced.push(`🔄 Loopback IP detected (127.x.x.x): ${ipTrimmed}`);
            }

            // Link-local addresses
            if (parts[0] === 169 && parts[1] === 254) {
              itemScore += 20;
              urlIssues += 1;
              itemReasons.push('🌐 Link-local IP address');
              categorizedReasons.context.push(`🌐 Link-local IP detected (APIPA): ${ipTrimmed}`);
            }

            // Reserved ranges (IANA)
            if (parts[0] === 0 ||
              (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) ||
              (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) ||
              (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) ||
              parts[0] >= 224) {
              itemScore += 18;
              urlIssues += 1;
              itemReasons.push('⚠️ Reserved/Testing IP range');
              categorizedReasons.advanced.push(`⚠️ Reserved/Testing IP range: ${ipTrimmed}`);
            }

            // Check for sequential IPs
            const isSequential = parts.every((part, index) => index === 0 || part === parts[index - 1] + 1 || part === parts[index - 1] - 1);
            if (isSequential && parts.length === 4) {
              itemScore += 12;
              keywordMatches += 1;
              itemReasons.push('🔢 Sequential IP pattern');
              categorizedReasons.context.push(`🔢 Sequential IP pattern detected (potential scanning): ${ipTrimmed}`);
            }

            // Check for suspicious patterns
            if (parts.every(p => p === parts[0])) {
              itemScore += 22;
              keywordMatches += 1;
              itemReasons.push('🚨 Identical digits pattern');
              categorizedReasons.advanced.push(`🚨 Identical digits pattern (suspicious): ${ipTrimmed}`);
            }

            // Check for round numbers
            if (parts.every(p => p % 10 === 0)) {
              itemScore += 15;
              keywordMatches += 1;
              itemReasons.push('🔢 Round number pattern');
              categorizedReasons.context.push(`🔢 Round number pattern (potential fake IP): ${ipTrimmed}`);
            }

            // Check for bogon IPs
            if ((parts[0] === 192 && parts[1] === 0 && parts[2] === 0) ||
              (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) ||
              (parts[0] === 198 && parts[1] === 18) ||
              (parts[0] === 198 && parts[1] === 19) ||
              (parts[0] >= 240)) {
              itemScore += 20;
              urlIssues += 1;
              itemReasons.push('🚫 Bogon IP (unassigned)');
              categorizedReasons.advanced.push(`🚫 Bogon IP detected (unassigned): ${ipTrimmed}`);
            }

            // Check for carrier-grade NAT
            if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) {
              itemScore += 8;
              urlIssues += 1;
              itemReasons.push('📡 Carrier-grade NAT IP');
              categorizedReasons.context.push(`📡 Carrier-grade NAT IP detected: ${ipTrimmed}`);
            }

            const cloudPrefixes = [/^34\./, /^52\./, /^44\./, /^18\./, /^3\./, /^35\./];
            if (cloudPrefixes.some(rx => rx.test(ipTrimmed))) {
              itemScore += 12;
              urlIssues += 1;
              itemReasons.push('☁️ Cloud provider range');
              categorizedReasons.advanced.push(`☁️ Cloud-hosted IP detected: ${ipTrimmed}`);
            }

            if (ipTrimmed.endsWith('.0') || ipTrimmed.endsWith('.255')) {
              itemScore += 8;
              itemReasons.push('⚠️ Edge octet (.0/.255)');
              categorizedReasons.context.push(`⚠️ Unusual IP octet edge: ${ipTrimmed}`);
            }

            if (/^185\.|^51\.|^95\./.test(ipTrimmed)) {
              itemScore += 18;
              itemReasons.push('🕸️ anonymous/Tor exit range');
              categorizedReasons.advanced.push(`🕸️ Potential Tor/anonymous IP: ${ipTrimmed}`);
            }

            let verdict = '✅ Safe IP';
            if (itemScore >= 70) verdict = '🚨 Phishing/Malicious IP';
            else if (itemScore >= 30) verdict = '⚠️ Suspicious IP';

            metadata.individualResults?.push({
              item: ipTrimmed,
              score: Math.min(itemScore, 100),
              verdict: verdict,
              riskLevel: itemScore < 30 ? 'safe' : itemScore < 70 ? 'suspicious' : 'phishing',
              reasons: itemReasons.length > 0 ? itemReasons : ['No immediate red flags detected']
            });

            if (itemScore > score) score = itemScore;
            reasons.push(`${verdict}: ${ipTrimmed}`);
            ipAnalysisResultsList.push({ ip: ipTrimmed });
          }
          if (ipAnalysisResultsList.length > 0) metadata.ipAnalysis = ipAnalysisResultsList;
          break;
        }

        case 'domain': {
          // Enhanced domain analysis
          const domainAnalysisResults: any[] = [];
          const domainLines = text.split('\n').filter(line => line.trim());

          // Whitelist of legitimate/safe domains
          const safeDomainWhitelist = ['google.com', 'github.com', 'github.io', 'amazon.com', 'microsoft.com', 'apple.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'gmail.com', 'outlook.com', 'slack.com', 'discord.com', 'wikipedia.org', 'stackoverflow.com', 'reddit.com', 'quora.com', 'medium.com', 'dev.to', 'hashnode.com', 'npm.org', 'pypi.org', 'rubygems.org', 'crates.io', 'nuget.org', 'maven.org', 'verizon.co.jp', 'harvard.edu'];

          for (const domain of domainLines) {
            const domainLower = domain.toLowerCase().trim();

            // Check if domain is on whitelist
            if (safeDomainWhitelist.includes(domainLower)) {
              reasons.push(`✅ Legitimate domain (${domain}): Trusted service provider`);
              continue;
            }

            // Basic domain validation
            const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!domainRegex.test(domainLower)) {
              reasons.push(`❌ Invalid domain format: ${domain}`);
              continue;
            }

            // Extract TLD
            const tld = domainLower.substring(domainLower.lastIndexOf('.'));
            const domainWithoutTld = domainLower.substring(0, domainLower.lastIndexOf('.'));

            // Check for suspicious TLDs (expanded list, enhanced like email section)
            const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.online', '.site', '.website', '.space', '.fun', '.tech', '.click', '.link', '.buzz', '.work', '.party', '.review', '.science', '.business', '.network', '.company', '.email', '.download', '.trade', '.bid', '.webcam', '.loan', '.win', '.date', '.faith', '.racing', '.review', '.science', '.accountant', '.cricket', '.football', '.golf', '.tennis', '.casino', '.poker', '.bet', '.blackjack', '.roulette', '.porn', '.sex', '.adult', '.xxx'];
            if (suspiciousTlds.includes(tld)) {
              score += 35; // Increased from 28 to 35 like email section
              urlIssues += 1;
              reasons.push(`⚠️ Suspicious TLD (commonly used for malicious sites): ${domain}`);
              categorizedReasons.urls.push(`⚠️ Suspicious TLD: ${tld}`);
            }

            // Check for premium TLDs that might be abused
            const premiumTlds = ['.io', '.ai', '.co', '.app', '.dev', '.tech', '.digital', '.cloud', '.store', '.shop', '.blog', '.news', '.media', '.agency', '.studio', '.design', '.group', '.team', '.center', '.zone', '.world', '.life', '.live', '.today', '.guru', '.expert', '.pro', '.solutions', '.systems', '.software', '.network', '.digital', '.online', '.website', '.site', '.space', '.tech', '.store', '.shop', '.blog', '.news', '.media', '.agency', '.studio', '.design', '.group', '.team', '.center', '.zone', '.world', '.life', '.live', '.today', '.guru', '.expert', '.pro', '.solutions', '.systems', '.software'];
            if (premiumTlds.includes(tld)) {
              score += 8;
              urlIssues += 1;
              reasons.push(`💎 Premium TLD (higher risk): ${domain}`);
            }

            // Check for long domains (potential DGA or typosquatting)
            if (domain.length > 50) {
              score += 18;
              keywordMatches += 1;
              reasons.push(`📏 Unusually long domain name (potential DGA/typosquatting): ${domain}`);
              categorizedReasons.advanced.push(`📏 Unusually long domain (potential DGA): ${domain.slice(0, 40)}...`);
            }

            // Check for very short domains (suspicious)
            if (domainWithoutTld.length < 3) {
              score += 15;
              keywordMatches += 1;
              reasons.push(`📏 Very short domain name: ${domain}`);
              categorizedReasons.advanced.push(`📏 Very short domain name: ${domain}`);
            }

            // Check for numbers in domain (potential DGA)
            const numberCount = (domain.match(/\d/g) || []).length;
            if (numberCount > 5) {
              score += 20;
              keywordMatches += 1;
              reasons.push(`🔢 High number of digits in domain (potential DGA): ${domain}`);
              categorizedReasons.advanced.push(`🔢 High number count in domain (potential DGA): ${numberCount} digits`);
            }

            // Check for consecutive numbers (very suspicious)
            if (/\d{3,}/.test(domainWithoutTld)) {
              score += 25;
              keywordMatches += 1;
              reasons.push(`🔢 Consecutive numbers in domain: ${domain}`);
              categorizedReasons.advanced.push(`🔢 Consecutive numbers detected in domain: ${domain}`);
            }

            // Check for hyphens (potential typosquatting)
            const hyphenCount = (domain.match(/-/g) || []).length;
            if (hyphenCount > 2) {
              score += 12;
              keywordMatches += 1;
              reasons.push(`➖ Excessive hyphens in domain: ${domain}`);
              categorizedReasons.grammar.push(`➖ Excessive hyphens detected (${hyphenCount}): ${domain}`);
            }

            // Check for repeated characters
            const repeatedChars = /(.)\1{2,}/;
            if (repeatedChars.test(domainWithoutTld)) {
              score += 15;
              keywordMatches += 1;
              reasons.push(`🔁 Repeated characters in domain: ${domain}`);
              categorizedReasons.grammar.push(`🔁 Repeated characters detected: ${domain}`);
            }

            // Check for suspicious keywords in domain (enhanced like email section) - skip for whitelisted
            // Only check keywords for non-whitelisted domains
            if (!safeDomainWhitelist.includes(domainLower)) {
              const suspiciousDomainKeywords = ['login', 'password', 'verify', 'account', 'security', 'bank', 'paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'instagram', 'netflix', 'update', 'confirm', 'validate', 'authenticate', 'secure', 'safe', 'trusted', 'official', 'support', 'help', 'service', 'admin', 'root', 'system', 'alert', 'warning', 'error', 'failed', 'suspended', 'locked', 'blocked', 'disabled', 'urgent', 'immediate', 'action', 'required', 'click', 'download', 'open', 'attachment', 'file', 'exe', 'zip', 'rar', 'pdf', 'doc', 'xls', 'ppt', 'free', 'prize', 'winner', 'lottery', 'claim', 'gift', 'bonus', 'reward', 'cash', 'money', 'bitcoin', 'crypto', 'wallet', 'investment', 'trading', 'forex', 'binary', 'options', 'scam', 'fraud', 'phish', 'hack', 'virus', 'malware', 'trojan', 'ransomware', 'spyware'];
              const foundDomainKeywords = suspiciousDomainKeywords.filter(kw => domainLower.includes(kw));
              if (foundDomainKeywords.length > 0) {
                score += foundDomainKeywords.length * 15; // Increased from 10 to 15 like email section
                keywordMatches += foundDomainKeywords.length;
                reasons.push(`⚠️ Suspicious keywords in domain: ${foundDomainKeywords.join(', ')} (${domain})`);
                categorizedReasons.context.push(`⚠️ Suspicious keywords: ${foundDomainKeywords.slice(0, 3).join(', ')}`);
              }
            }

            // Check for brand impersonation (enhanced like email section) - skip for whitelisted
            if (!safeDomainWhitelist.includes(domainLower)) {
              const brands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'instagram', 'netflix', 'bank', 'twitter', 'linkedin', 'youtube', 'whatsapp', 'telegram', 'skype', 'zoom', 'slack', 'discord', 'ebay', 'alibaba', 'aliexpress', 'walmart', 'target', 'bestbuy', 'costco', 'home depot', 'lowes', 'ikea', 'nordstrom', 'macys', 'kohls', 'jcpenney', 'sears', 'kmart', 'overstock', 'wayfair', 'etsy', 'craigslist', 'indeed', 'monster', 'glassdoor', 'ziprecruiter', 'dice', 'careerbuilder', 'snagajob',
                'bkash', 'nagad', 'rocket', 'daraz', 'pathao', 'shohoz', 'chaldal', 'sonali', 'brac', 'dutch bangla', 'dbbl', 'city bank', 'janata bank', 'islami bank', 'robi', 'banglalink'];
              for (const brand of brands) {
                if (domainLower.includes(brand) && !domainLower.includes(`${brand}.com`) && !domainLower.includes(`${brand}.org`) && !domainLower.includes(`${brand}.net`) && !domainLower.includes(`${brand}.edu`)) {
                  score += 35; // Increased from 30 to 35 like email section
                  brandImpersonation = true;
                  reasons.push(`🎭 Brand impersonation detected: ${brand} (${domain})`);
                  categorizedReasons.brand.push(`🎭 Brand impersonation: ${brand}`);
                  break;
                }
              }
            }

            // Check for homograph attacks (similar looking characters)
            const suspiciousChars = /[а-яё]/i; // Cyrillic characters that look like Latin
            if (suspiciousChars.test(domainWithoutTld)) {
              score += 25;
              keywordMatches += 1;
              reasons.push(`🔤 Homograph attack detected (similar characters): ${domain}`);
              categorizedReasons.advanced.push(`🔤 Homograph attack detected (similar chars): ${domain}`);
            }

            // Check for excessive subdomains
            const subdomainCount = (domain.match(/\./g) || []).length;
            if (subdomainCount > 3) {
              score += 15;
              urlIssues += 1;
              reasons.push(`🌐 Excessive subdomains (${subdomainCount}): ${domain}`);
              categorizedReasons.urls.push(`🌐 Excessive subdomains (${subdomainCount})`);
            }

            // Check for punycode domains (internationalized domain names)
            if (domainLower.startsWith('xn--')) {
              score += 20;
              urlIssues += 1;
              reasons.push(`🌍 Punycode domain (potential homograph attack): ${domain}`);
              categorizedReasons.advanced.push(`🌍 Punycode domain (homograph risk): ${domain}`);
            }

            reasons.push(`🌐 Domain analyzed: ${domain}`);
            domainAnalysisResults.push({ domain, tld });

            // Additional domain heuristics: simple leet/typosquatting detection
            const normalizeLeet = (s: string) => s.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/\|/g, 'l');
            const normalized = normalizeLeet(domainLower);
            const brandChecks = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'netflix', 'facebook', 'instagram', 'bank', 'paypal', 'github', 'gitlab', 'docker', 'aws', 'azure'];
            for (const b of brandChecks) {
              if (normalized.includes(b) && !domainLower.includes(`${b}.`)) {
                score += 30;
                brandImpersonation = true;
                reasons.push(`🎭 Possible typosquatting / brand lookalike detected: ${domain} (similar to ${b})`);
                categorizedReasons.brand.push(`🎭 Typosquatting/brand lookalike: ${b} -> ${domain}`);
                break;
              }
            }

          }
          if (domainAnalysisResults.length > 0) metadata.domainAnalysis = domainAnalysisResults;
          break;
        }
      }

      // Prefer the stronger result, without double-counting the same signal
      // from the shared scan and the detailed legacy branch.
      score = Math.min(Math.max(score, sharedBaseScore), 100);
      keywordMatches = Math.max(keywordMatches, sharedScan.keywordMatches);
      urlIssues = Math.max(urlIssues, sharedScan.urlIssues);
      sensitiveRequests = Math.max(sensitiveRequests, sharedScan.sensitiveRequests);
      brandImpersonation = brandImpersonation || sharedScan.brandImpersonation;
      const confidence = Math.min(96, Math.max(sharedScan.confidence, 60 + Math.min(reasons.length * 3, 24)));

      if (score === 0 && reasons.length === 0) {
        reasons.push('✅ No immediate threats detected');
      }

      setAnalysisSteps(prev => prev.map((s, i) => i <= 2 ? { ...s, status: 'complete' } : { ...s, status: 'active' }));

      // Merge categorizedReasons collected during analysis with any generic reason strings
      const mergedCategorized = {
        urls: Array.from(new Set([...(categorizedReasons.urls || []), ...reasons.filter(r => /https?:\/\/|url|link|domain|IP-based|IP analyzed|Domain analyzed|URL analyzed|Excessive links|Shortened|TLD|suspicious TLD|redirect/i.test(r))])),
        brand: Array.from(new Set([...(categorizedReasons.brand || []), ...reasons.filter(r => /brand|impersonation|🎭|Brand impersonation/i.test(r))])),
        content: Array.from(new Set([...(categorizedReasons.content || []), ...(categorizedReasons.grammar || []), ...(categorizedReasons.context || []), ...reasons.filter(r => /phras|phishing phrases|punctuation|capitaliz|grammar|excessive punctuation|urgent|prize|threat|time|region|Requests sensitive information|generic greeting|all caps|exclamation|repeated punctuation/i.test(r))])),
        grammar: Array.from(new Set([...(categorizedReasons.grammar || []), ...reasons.filter(r => /phras|phishing phrases|punctuation|capitaliz|grammar|excessive punctuation|Inconsistent capitalization|all caps|exclamation|repeated punctuation/i.test(r))])),
        attachments: Array.from(new Set([...(categorizedReasons.attachments || []), ...reasons.filter(r => /attachment|file|download|password-protected|locked|protected file|Large file size|Double file extension/i.test(r))])),
        advanced: Array.from(new Set([...(categorizedReasons.advanced || []), ...reasons.filter(r => /mixed character|homograph|punycode|character sets|Mixed character sets|Homograph|Punycode|base64|obfuscation/i.test(r))])),
        headers: Array.from(new Set([...(categorizedReasons.headers || []), ...reasons.filter(r => /SPF|DKIM|DMARC|No SPF|No DKIM|No DMARC|authentication-results|Reply-To|From\(/i.test(r))])),
        context: Array.from(new Set([...(categorizedReasons.context || []), ...reasons.filter(r => /urgent|prize|threat|time|region|Requests sensitive information|suspicious time|Bangladesh-specific|Detected region/i.test(r))])),
        other: Array.from(new Set([...(categorizedReasons.other || []), ...reasons.filter(r => {
          // Exclude anything already placed in other categories
          const inOther = /https?:\/\/|url|link|domain|IP analyzed|Excessive links|Shortened|TLD|brand|impersonation|phras|phishing phrases|punctuation|capitaliz|attachment|file|download|password-protected|locked|protected file|mixed character|homograph|punycode|SPF|DKIM|DMARC|urgent|prize|threat|time|region|Requests sensitive information/i;
          return !inOther.test(r);
        })]))
      };

      const newResult: PhishingResult = {
        score,
        reasons,
        categorizedReasons: mergedCategorized,
        details: {
          keywordMatches,
          urlIssues,
          sensitiveRequests,
          brandImpersonation,
          riskLevel: score < 30 ? 'safe' : score < 70 ? 'suspicious' : 'phishing',
          totalIndicators: keywordMatches + urlIssues + sensitiveRequests + (brandImpersonation ? 1 : 0)
        },
        confidence,
        timestamp: Date.now(),
        emailPreview: inputType === 'email' ? text.substring(0, 100) : undefined,
        inputType,
        inputContent: text,
        metadata,
        // Enhanced analysis details for professional output
        analysisDetails: {
          engines: [
            { name: 'Keyword Analysis', status: keywordMatches > 0 ? 'suspicious' : 'clean', score: Math.min(keywordMatches * 8, 40) },
            { name: 'URL Reputation', status: urlIssues > 0 ? 'suspicious' : 'clean', score: Math.min(urlIssues * 15, 35) },
            { name: 'Content Analysis', status: sensitiveRequests > 0 ? 'malicious' : 'clean', score: Math.min(sensitiveRequests * 20, 40) },
            { name: 'Brand Protection', status: brandImpersonation ? 'malicious' : 'clean', score: brandImpersonation ? 25 : 0 },
            { name: 'Behavioral Analysis', status: score > 50 ? 'suspicious' : 'clean', score: Math.min(score * 0.3, 20) }
          ],
          threatLevel: score < 30 ? 'Low' : score < 70 ? 'Medium' : 'High',
          riskFactors: reasons.length,
          communityFeedback: {
            similarReports: 0,
            firstSeen: 'Not available',
            lastSeen: 'Not available'
          },
          detectionRatio: 'Heuristic analysis only',
          categories: score < 30 ? ['Clean'] : score < 70 ? ['Suspicious', 'Potential Phishing'] : ['Phishing', 'Malicious', 'High Risk']
        }
      };

      setResult(newResult);

      const newHistory: AnalysisHistory = {
        id: Date.now().toString(),
        result: newResult,
        timestamp: Date.now(),
        inputType,
        inputContent: inputType === 'email' ? emailText :
          inputType === 'file' ? (fileNameText || file?.name || '') :
            inputType === 'url' ? urlText :
              inputType === 'ip' ? ipText :
                domainText
      };
      setHistory([newHistory, ...history.slice(0, 19)]);
      setSidebarHistory([newHistory, ...sidebarHistory.slice(0, 19)]);

      const newStats = {
        ...stats,
        totalAnalyses: stats.totalAnalyses + 1,
        phishingDetected: score >= 70 ? stats.phishingDetected + 1 : stats.phishingDetected,
        safeEmails: score < 30 ? stats.safeEmails + 1 : stats.safeEmails,
        achievements: stats.achievements || []
      };

      const unlockedAchievements = checkAchievements(newStats);

      if (unlockedAchievements.length > 0) {
        newStats.achievements = [...newStats.achievements, ...unlockedAchievements];
        unlockedAchievements.forEach(achievement => {
          toast.custom(() => <AchievementToast achievement={achievement} />, { position: 'top-right' });
        });
      }

      setStats(newStats);

      setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));

      setIsLoading(false);

      if (score < 30) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`${inputType.charAt(0).toUpperCase() + inputType.slice(1)} looks safe! ✅`);
      } else if (score >= 70) {
        if (cardRef.current) {
          cardRef.current.style.animation = 'shake 0.5s';
          setTimeout(() => {
            if (cardRef.current) cardRef.current.style.animation = '';
          }, 500);
        }
        toast.custom(() => (
          <div className="bg-destructive/10 backdrop-blur-xl border border-destructive/30 p-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px]">
            <div className="bg-destructive/20 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base">High Risk Detected!</h4>
              <p className="text-sm text-muted-foreground">Severe phishing indicators found.</p>
            </div>
          </div>
        ), { duration: 5000, position: 'bottom-center' });
      } else {
        toast.warning('Suspicious content - be cautious');
      }

      return newResult;
    }
    catch (err: any) {
      console.error('performAnalysis error', err);
      setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'error' })));
      setIsLoading(false);
      toast.error('Analysis failed: ' + (err?.message || 'Unknown error'));
      const fallback: PhishingResult = {
        score: 0,
        confidence: 0,
        reasons: [],
        categorizedReasons: {
          urls: [], brand: [], grammar: [], attachments: [], advanced: [], headers: [], context: [], other: []
        },
        details: { keywordMatches: 0, urlIssues: 0, sensitiveRequests: 0, brandImpersonation: false },
        analysisDetails: {}
      } as PhishingResult;
      return fallback;
    }
  };

  const copyResults = () => {
    if (!result) return;

    const text = `Phishing Analysis Report\nScore: ${result.score}/100\nStatus: ${result.score < 30 ? 'Safe' : result.score < 70 ? 'Suspicious' : 'Phishing'}\nConfidence: ${result.confidence}%\n\nDetection Reasons:\n${result.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Results copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'success';
    if (score < 70) return 'warning';
    return 'danger';
  };

  const resetAnalysis = () => {
    setEmailText('');
    setFile(null);
    setUrlText('');
    setIpText('');
    setDomainText('');
    setSelectedExampleFile(null);
    setFileNameText('');
    setResult(null);
    setRealtimeScore(0);
    setAnalysisSteps([]);
  };

  const chartData = result ? [
    { name: 'Keywords', value: result.details.keywordMatches, color: '#f59e0b' },
    { name: 'URLs', value: result.details.urlIssues, color: '#ef4444' },
    { name: 'Sensitive', value: result.details.sensitiveRequests, color: '#dc2626' }
  ].filter(d => d.value > 0) : [];

  const handleExportCSV = () => {
    exportHistoryToCSV(history);
    if (!stats.achievements?.some(a => a.id === 'csv-exporter')) {
      const newAchievement = { id: 'csv-exporter', title: 'Data Analyst', description: 'Exported analysis to CSV', icon: '📊', unlocked: true };
      setStats({ ...stats, achievements: [...(stats.achievements || []), newAchievement] });
      toast.custom(() => <AchievementToast achievement={newAchievement} />, { position: 'top-right' });
    }
  };

  const handleExportJSON = () => {
    console.log('handleExportJSON called', { hasResult: !!result, historyLength: history.length });
    if (result) {
      console.log('Exporting result to JSON');
      exportResultToJSON(result, emailText);
      toast.success('Analysis exported as JSON!');
    } else {
      console.log('Exporting history to JSON');
      exportHistoryToJSON(history);
      toast.success('History exported as JSON!');
    }
  };

  const handleQuizAchievement = (achievement: any) => {
    if (!stats.achievements?.some(a => a.id === achievement.id)) {
      setStats({ ...stats, achievements: [...(stats.achievements || []), achievement] });
    }
  };

  return (
    <TooltipProvider>
      {/* Onboarding Tour */}
      {!showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(true)} />
      )}

      {/* Skip to main content for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Navigation Bar */}
      <Navbar
        onHistoryClick={() => setHistoryOpen(!historyOpen)}
        onQuizClick={() => setQuizOpen(!quizOpen)}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onHistoryClick={() => setHistoryOpen(!historyOpen)}
        onQuizClick={() => setQuizOpen(!quizOpen)}
        onAIClick={() => setShowAI(!showAI)}
        onExportClick={handleExportCSV}
        onAPIKeysClick={() => setApiModalOpen(true)}
        historyLength={history.length}
      />

      <main className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12" id="main-content">
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
        `}</style>

        {/* Desktop Quick Actions - Hidden on Mobile */}
        <div className="hidden md:flex fixed top-20 right-4 flex-col gap-2 z-30 no-print">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAI(!showAI)}
                  className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all animate-glow-pulse shadow-sm hover:shadow-md"
                >
                  <div className="relative w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-sm ring-1 ring-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]"></div>
                    <Brain className="w-3.5 h-3.5 relative z-10" />
                  </div>
                  <span className="font-semibold text-sm bg-gradient-primary bg-clip-text text-transparent">Nio AI</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Assistant</TooltipContent>
            </Tooltip>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={history.length === 0 && !result}
                  className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all shadow-sm hover:shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-semibold text-sm">Export</span>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border z-50">
              <DropdownMenuItem
                onClick={handleExportCSV}
                disabled={history.length === 0}
                className="cursor-pointer hover:bg-primary/10"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => result && exportToPDF(result, emailText)}
                disabled={!result}
                className="cursor-pointer hover:bg-primary/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportJSON}
                disabled={history.length === 0 && !result}
                className="cursor-pointer hover:bg-primary/10"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Inline API Keys button (replaces More dropdown) */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApiModalOpen(true)}
                  className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all shadow-sm hover:shadow-md"
                >
                  <FileJson className="w-4 h-4" />
                  <span className="font-semibold text-sm">API Keys</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage API keys</TooltipContent>
            </Tooltip>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl mx-auto md:translate-x-px"
        >

          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gradient-primary mb-4 md:mb-6 shadow-glow relative"
            >
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-primary-foreground" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3 md:mb-6 tracking-tight leading-tight pb-1"
            >
              EchoMe
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2"
            >
              Harness next-generation AI algorithms to instantly intercept dynamic phishing attacks, trace hidden malicious URLs, and neutralize deceptive content across all vectors.
            </motion.p>
          </div>


          {/* AI Assistant Popup */}
          <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

          <InputTypeSelector selectedType={inputType} onTypeChange={setInputType} />

          <TipsCarousel />

          <AnimatePresence>
            {showHeaderParser && inputType === 'email' && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6"
              >
                <EmailHeaderParser />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showScreenshot && inputType === 'email' && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6"
              >
                <ScreenshotAnalyzer onAnalyze={setEmailText} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showURLScreenshot && inputType === 'url' && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6"
              >
                <URLScreenshotAnalyzer onAnalyze={setUrlText} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showIPScreenshot && inputType === 'ip' && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6"
              >
                <IPScreenshotAnalyzer onAnalyze={setIpText} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDomainScreenshot && inputType === 'domain' && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6"
              >
                <DomainScreenshotAnalyzer onAnalyze={setDomainText} />
              </motion.div>
            )}
          </AnimatePresence>







          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            ref={cardRef}
          >
            <APIKeysModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} />
            <Card className="p-6 bg-gradient-card border-border shadow-xl backdrop-blur-sm">
              {isLoading && analysisSteps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProgressStepper steps={analysisSteps} />
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="flex gap-3 flex-wrap mb-4">
                  {inputType === 'email' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHeaderParser(!showHeaderParser)}
                        className={`gap-2 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border-primary/30 hover:border-primary/50 transition-all shadow-sm hover:shadow-md ${showHeaderParser ? 'shadow-lg shadow-primary/50 animate-glow border-primary/70' : ''
                          }`}
                      >
                        <FileText className="w-4 h-4" />
                        Email Headers
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowScreenshot(!showScreenshot);
                          if (!showScreenshot && !stats.achievements?.some(a => a.id === 'screenshot-user')) {
                            const newAchievement = { id: 'screenshot-user', title: 'Screenshot Analyzer', description: 'Used screenshot OCR for the first time', icon: '📸', unlocked: true };
                            setStats({ ...stats, achievements: [...(stats.achievements || []), newAchievement] });
                          }
                        }}
                        className={`gap-2 bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30 hover:border-accent/50 transition-all shadow-sm hover:shadow-md ${showScreenshot ? 'shadow-lg shadow-accent/50 animate-glow border-accent/70' : ''
                          }`}
                      >
                        <Download className="w-4 h-4" />
                        Screenshot OCR
                      </Button>
                    </>
                  )}

                  {inputType === 'url' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowURLScreenshot(!showURLScreenshot)}
                      className={`gap-2 bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30 hover:border-accent/50 transition-all shadow-sm hover:shadow-md ${showURLScreenshot ? 'shadow-lg shadow-accent/50 animate-glow border-accent/70' : ''}`}
                    >
                      <Download className="w-4 h-4" />
                      URL Screenshot OCR
                    </Button>
                  )}

                  {inputType === 'ip' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIPScreenshot(!showIPScreenshot)}
                      className={`gap-2 bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30 hover:border-accent/50 transition-all shadow-sm hover:shadow-md ${showIPScreenshot ? 'shadow-lg shadow-accent/50 animate-glow border-accent/70' : ''}`}
                    >
                      <Download className="w-4 h-4" />
                      IP Screenshot OCR
                    </Button>
                  )}

                  {inputType === 'domain' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDomainScreenshot(!showDomainScreenshot)}
                      className={`gap-2 bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30 hover:border-accent/50 transition-all shadow-sm hover:shadow-md ${showDomainScreenshot ? 'shadow-lg shadow-accent/50 animate-glow border-accent/70' : ''}`}
                    >
                      <Download className="w-4 h-4" />
                      Domain Screenshot OCR
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparison(true)}
                    className="gap-2 bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30 hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Side-by-Side Comparison
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowRadar(!showRadar);
                      if (!showRadar && !stats.achievements?.some(a => a.id === 'radar-user')) {
                        const newAchievement = { id: 'radar-user', title: 'Radar Master', description: 'Used security radar chart', icon: '📡', unlocked: true };
                        setStats({ ...stats, achievements: [...(stats.achievements || []), newAchievement] });
                      }
                    }}
                    className={`gap-2 bg-gradient-to-r from-success/5 to-success/10 hover:from-success/10 hover:to-success/20 border-success/30 hover:border-success/50 transition-all shadow-sm hover:shadow-md ${showRadar ? 'shadow-lg shadow-success/50 animate-glow border-success/70' : ''
                      }`}
                  >
                    <Radar className="w-4 h-4" />
                    Security Radar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowHeatMap(!showHeatMap);
                      if (!showHeatMap && !stats.achievements?.some(a => a.id === 'heatmap-user')) {
                        const newAchievement = { id: 'heatmap-user', title: 'Heat Vision', description: 'Activated threat heat map', icon: '🔥', unlocked: true };
                        setStats({ ...stats, achievements: [...(stats.achievements || []), newAchievement] });
                      }
                    }}
                    className={`gap-2 bg-gradient-to-r from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/20 border-warning/30 hover:border-warning/50 transition-all shadow-sm hover:shadow-md ${showHeatMap ? 'shadow-lg shadow-warning/50 animate-glow border-warning/70' : ''
                      }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Threat Heat Map
                  </Button>
                </div>

                {showHeatMap && (
                  <AnimatePresence mode="wait" initial={false}>
                    {inputType === 'email' && (
                      <EmailHeatMap key="email-heatmap" emailText={emailText} result={result} />
                    )}
                    {inputType === 'file' && (
                      <FileHeatMap key="file-heatmap" fileName={file?.name || fileNameText} result={result} />
                    )}
                    {inputType === 'url' && (
                      <URLHeatMap key="url-heatmap" urlText={urlText} result={result} />
                    )}
                    {inputType === 'ip' && (
                      <IPHeatMap key="ip-heatmap" ipText={ipText} result={result} />
                    )}
                    {inputType === 'domain' && (
                      <DomainHeatMap key="domain-heatmap" domainText={domainText} result={result} />
                    )}
                  </AnimatePresence>
                )}

                {inputType === 'email' && (
                  <>
                    <ExampleEmailSelector onSelectEmail={setEmailText} onAnalyzeEmail={performAnalysis} />

                    <div>
                      <label htmlFor="email-input" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Email Content Analysis
                        <ContextualHelp
                          title="How it works"
                          content="Our AI analyzes email content in real-time, checking for phishing indicators like urgency, suspicious links, and sensitive data requests. The border color indicates threat level."
                          position="right"
                        />
                      </label>
                      <Textarea
                        ref={textareaRef}
                        id="email-input"
                        placeholder="Paste the email content here for comprehensive phishing analysis..."
                        value={emailText}
                        onChange={(e) => setEmailText(e.target.value)}
                        className={`min-h-[240px] bg-background text-foreground resize-none transition-all duration-300 ${realtimeScore === 0
                          ? 'border-border focus:ring-2 focus:ring-primary'
                          : realtimeScore < 30
                            ? 'border-success focus:ring-2 focus:ring-success shadow-[0_0_15px_hsl(var(--success)/0.3)]'
                            : realtimeScore < 70
                              ? 'border-warning focus:ring-2 focus:ring-warning shadow-[0_0_15px_hsl(var(--warning)/0.3)] animate-border-pulse'
                              : 'border-danger focus:ring-2 focus:ring-danger shadow-[0_0_20px_hsl(var(--danger)/0.5)] animate-border-glow'
                          }`}
                        aria-label="Email content for phishing analysis"
                        aria-describedby="textarea-help"
                      />
                      <URLHighlighter emailText={emailText} />
                    </div>
                  </>
                )}

                {inputType === 'url' && (
                  <>
                    <ExampleUrlSelector
                      onSelectUrl={(url, example) => {
                        setUrlText(url);
                        setSelectedExampleUrl(example || null);
                      }}
                      onAnalyzeUrl={performAnalysis}
                    />

                    {selectedExampleUrl && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm font-medium">Selected:</span>
                        <span className="text-xs flex items-center gap-1">
                          <span className="font-medium">{selectedExampleUrl.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${selectedExampleUrl.category === 'safe' ? 'bg-success/20 text-success' :
                            selectedExampleUrl.category === 'suspicious' ? 'bg-warning/20 text-warning' :
                              'bg-danger/20 text-danger'
                            }`}>
                            {selectedExampleUrl.category}
                          </span>
                        </span>
                      </div>
                    )}
                    <div>
                      <label htmlFor="url-input" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Link className="w-4 h-4 text-primary" />
                        URL Analysis
                        <ContextualHelp
                          title="URL Analysis"
                          content="Enter a URL to check for phishing indicators, suspicious domains, and malicious redirects. The border color indicates threat level."
                          position="right"
                        />
                      </label>
                      <Textarea
                        id="url-input"
                        placeholder="Enter URL(s) to analyze... (one per line)"
                        value={urlText}
                        onChange={(e) => setUrlText(e.target.value)}
                        className={`min-h-[120px] bg-background text-foreground resize-none transition-all duration-300 ${realtimeScore === 0
                          ? 'border-border focus:ring-2 focus:ring-primary'
                          : realtimeScore < 30
                            ? 'border-success focus:ring-2 focus:ring-success shadow-[0_0_15px_hsl(var(--success)/0.3)]'
                            : realtimeScore < 70
                              ? 'border-warning focus:ring-2 focus:ring-warning shadow-[0_0_15px_hsl(var(--warning)/0.3)] animate-border-pulse'
                              : 'border-danger focus:ring-2 focus:ring-danger shadow-[0_0_20px_hsl(var(--danger)/0.5)] animate-border-glow'
                          }`}
                        aria-label="URL for phishing analysis"
                      />
                      {selectedExampleUrl && (
                        <div className="mt-2 p-4 bg-secondary/30 border border-border rounded-lg">
                          <h4 className="font-semibold mb-2">URL Content Analysis:</h4>
                          <p className="text-sm text-muted-foreground mb-3">{selectedExampleUrl.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Detected URL:</strong> {selectedExampleUrl.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {inputType === 'ip' && (
                  <>
                    <ExampleIPSelector
                      onSelectIP={setIpText}
                      onAnalyzeIP={performAnalysis}
                      onSelectExample={setSelectedExampleIP}
                    />

                    {selectedExampleIP && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm font-medium">Selected:</span>
                        <span className="text-xs flex items-center gap-1">
                          <span className="font-medium">{selectedExampleIP.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${selectedExampleIP.category === 'safe' ? 'bg-success/20 text-success' :
                            selectedExampleIP.category === 'suspicious' ? 'bg-warning/20 text-warning' :
                              'bg-danger/20 text-danger'
                            }`}>
                            {selectedExampleIP.category}
                          </span>
                        </span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="ip-input" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        IP Address Analysis
                        <ContextualHelp
                          title="IP Analysis"
                          content="Enter an IP address to check reputation, geolocation, and potential malicious activity. The border color indicates threat level."
                          position="right"
                        />
                      </label>
                      <Textarea
                        id="ip-input"
                        placeholder="Enter IP address(es) to analyze... (one per line)"
                        value={ipText}
                        onChange={(e) => setIpText(e.target.value)}
                        className={`min-h-[120px] bg-background text-foreground resize-none transition-all duration-300 ${realtimeScore === 0
                          ? 'border-border focus:ring-2 focus:ring-primary'
                          : realtimeScore < 30
                            ? 'border-success focus:ring-2 focus:ring-success shadow-[0_0_15px_hsl(var(--success)/0.3)]'
                            : realtimeScore < 70
                              ? 'border-warning focus:ring-2 focus:ring-warning shadow-[0_0_15px_hsl(var(--warning)/0.3)] animate-border-pulse'
                              : 'border-danger focus:ring-2 focus:ring-danger shadow-[0_0_20px_hsl(var(--danger)/0.5)] animate-border-glow'
                          }`}
                        aria-label="IP address for analysis"
                      />
                      {selectedExampleIP && (
                        <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                          <h4 className="font-semibold mb-2">IP Content Analysis:</h4>
                          <p className="text-sm text-muted-foreground mb-3">{selectedExampleIP.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Detected IP:</strong> {selectedExampleIP.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {inputType === 'file' && (
                  <>
                    <ExampleFileSelector
                      onSelectFile={(fileName, fileType, fileSize, exampleFile) => {
                        // Create a mock file object for demonstration
                        const mockFile = new File([], fileName, { type: fileType });
                        // Override the size property
                        (mockFile as any).size = fileSize;
                        setFile(mockFile);
                        setSelectedExampleFile(exampleFile);
                        setFileNameText(fileName);
                      }}
                    />

                    <div>
                      {selectedExampleFile && (
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-sm font-medium">Selected:</span>
                          <span className="text-xs flex items-center gap-1">
                            <span className="font-medium">{selectedExampleFile.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${selectedExampleFile.category === 'safe' ? 'bg-success/20 text-success' :
                              selectedExampleFile.category === 'suspicious' ? 'bg-warning/20 text-warning' :
                                'bg-danger/20 text-danger'
                              }`}>
                              {selectedExampleFile.category}
                            </span>
                          </span>
                        </div>
                      )}
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {file ? (
                          <div className="space-y-2">
                            <FileText className="w-12 h-12 mx-auto text-primary" />
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                            </p>
                            {selectedExampleFile && (
                              <div className="mt-2 p-2 bg-secondary/30 border border-border rounded text-xs">
                                <p className="font-medium">{selectedExampleFile.title}</p>
                                <p className="text-muted-foreground">{selectedExampleFile.description}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Supports all file types up to 10MB</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*, application/*, text/*, .pdf, .doc, .docx, .txt, .csv"
                        className="hidden"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          setSelectedExampleFile(null); // Clear example file when user uploads their own
                          setFileNameText(e.target.files?.[0]?.name || '');
                        }}
                      />
                    </div>
                  </>
                )}

                {inputType === 'domain' && (
                  <>
                    <ExampleDomainSelector onSelectDomain={setDomainText} onAnalyzeDomain={performAnalysis} onSelectExample={setSelectedExampleDomain} />

                    {selectedExampleDomain && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm font-medium">Selected:</span>
                        <span className="text-xs flex items-center gap-1">
                          <span className="font-medium">{selectedExampleDomain.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${selectedExampleDomain.category === 'safe' ? 'bg-success/20 text-success' :
                            selectedExampleDomain.category === 'suspicious' ? 'bg-warning/20 text-warning' :
                              'bg-danger/20 text-danger'
                            }`}>
                            {selectedExampleDomain.category}
                          </span>
                        </span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="domain-input" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Domain Analysis
                        <ContextualHelp
                          title="Domain Analysis"
                          content="Enter a domain name to check reputation, registration details, and potential malicious activity."
                          position="right"
                        />
                      </label>
                      <Textarea
                        id="domain-input"
                        placeholder="Enter domain(s) to analyze... (one per line)"
                        value={domainText}
                        onChange={(e) => setDomainText(e.target.value)}
                        className={`min-h-[120px] bg-background text-foreground resize-none transition-all duration-300 ${realtimeScore === 0
                          ? 'border-border focus:ring-2 focus:ring-primary'
                          : realtimeScore < 30
                            ? 'border-success focus:ring-2 focus:ring-success shadow-[0_0_15px_hsl(var(--success)/0.3)]'
                            : realtimeScore < 70
                              ? 'border-warning focus:ring-2 focus:ring-warning shadow-[0_0_15px_hsl(var(--warning)/0.3)] animate-border-pulse'
                              : 'border-danger focus:ring-2 focus:ring-danger shadow-[0_0_20px_hsl(var(--danger)/0.5)] animate-border-glow'
                          }`}
                        aria-label="Domain for analysis"
                      />
                      {selectedExampleDomain && (
                        <div className="mt-2 p-4 bg-secondary/30 border border-border rounded-lg">
                          <h4 className="font-semibold mb-2">Domain Content Analysis:</h4>
                          <p className="text-sm text-muted-foreground mb-3">{selectedExampleDomain.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Detected Domain:</strong> {selectedExampleDomain.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <RippleButton
                    id="analyze-button"
                    onClick={analyzeInput}
                    disabled={(!getCurrentInputText().trim() && inputType !== 'file') || (inputType === 'file' && !file && !fileNameText.trim()) || isLoading}
                    className="flex-1 bg-gradient-primary hover:opacity-90 transition-all text-primary-foreground font-semibold py-6 text-base shadow-glow hover:shadow-lg relative overflow-hidden"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center"
                        >
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <motion.span
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            Analyzing with AI...
                          </motion.span>
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Analyze {inputType.charAt(0).toUpperCase() + inputType.slice(1)}
                      </>
                    )}
                  </RippleButton>

                  {(getCurrentInputText() || result) && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          <Button
                            onClick={resetAnalysis}
                            variant="outline"
                            className="py-6 px-6 border-border hover:bg-secondary/50"
                          >
                            <RefreshCw className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>Reset</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading && !result && <AnalysisCardSkeleton />}
            {result && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-6"
              >
                <Card className="p-6 bg-gradient-card border-border shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-bold text-foreground"
                    >
                      Analysis Results
                    </motion.h2>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={copyResults}
                            >
                              <motion.div
                                initial={false}
                                animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </motion.div>
                            </Button>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>Copy Results</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportToPDF(result, emailText)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>Export to PDF</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleExportJSON}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              JSON
                            </Button>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>Export to JSON</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground">Threat Score</span>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                          className={`text-4xl font-bold ${result.score < 30 ? 'text-success' : result.score < 70 ? 'text-warning' : 'text-danger'
                            } ${result.score >= 70 ? 'animate-pulse' : ''}`}
                        >
                          <AnimatedCounter value={result.score} duration={1500} />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <span className={`font-semibold ${result.score < 30 ? 'text-success' : result.score < 70 ? 'text-warning' : 'text-danger'
                            }`}>
                            {result.score < 30 ? '✅ SAFE' : result.score < 70 ? '⚠️ SUSPICIOUS' : '🚨 PHISHING'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-semibold">{result.confidence.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Keywords</span>
                          <span className="font-semibold">{result.details.keywordMatches}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">URL Issues</span>
                          <span className="font-semibold">{result.details.urlIssues}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sensitive Requests</span>
                          <span className="font-semibold">{result.details.sensitiveRequests}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Brand Impersonation</span>
                          <span className="font-semibold">{result.details.brandImpersonation ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    {chartData.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Threat Breakdown</h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="35%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={65}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={50} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Keywords & Sensitive URLs</h4>
                          <div className="text-xs text-muted-foreground">
                            {result.details.keywordMatches > 0 && (
                              <div>• Keywords detected: {result.details.keywordMatches}</div>
                            )}
                            {result.details.urlIssues > 0 && (
                              <div>• URL issues found: {result.details.urlIssues}</div>
                            )}
                            {result.details.sensitiveRequests > 0 && (
                              <div>• Sensitive data requests: {result.details.sensitiveRequests}</div>
                            )}
                            {result.details.brandImpersonation && (
                              <div>• Brand impersonation detected</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Detection Reasons</h3>

                    {/* Small helper to render each category with collapse and parsed details */}
                    <div className="space-y-2">
                      {(() => {
                        // Render detection categories (uses component-scoped expansion state)

                        const CategoryPanel = ({ icon, title, reasons }: { icon: JSX.Element; title: string; reasons: string[] }) => {
                          const isOpen = openCategories[title] ?? true;
                          if (!reasons || reasons.length === 0) return null;

                          const containerVariant = {
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.06, when: 'beforeChildren' } }
                          } as any;

                          const itemVariant = {
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
                          } as any;

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
                                <motion.div variants={containerVariant} initial="hidden" animate="visible" className="bg-transparent">
                                  {reasons.map((reason, index) => {
                                    const parts = reason.split(':');
                                    const titleText = parts[0] || reason;
                                    const detail = parts.slice(1).join(':').trim();
                                    const id = `${title}-${index}`;
                                    const isExpanded = expandedIdGlobal === id;

                                    return (
                                      <div key={id} className="p-1">
                                        <motion.div
                                          variants={itemVariant}
                                          whileHover={{ scale: 1.01 }}
                                          className="flex items-start gap-3 cursor-pointer border-2 border-border/80 rounded-md p-2 bg-secondary/20"
                                          onClick={() => {
                                            if (isExpanded) setExpandedIdGlobal(null);
                                            else {
                                              setExpandedIdGlobal(id);
                                              setOpenCategories(() => {
                                                const obj: Record<string, boolean> = {};
                                                categoryKeys.forEach(k => obj[k] = false);
                                                obj[title] = true;
                                                return obj;
                                              });
                                            }
                                          }}
                                        >
                                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">{index + 1}</div>
                                          <div className="flex-1">
                                            <div className="bg-transparent p-0">
                                              <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium text-foreground truncate">{titleText.trim()}</div>
                                                <div className="text-xs text-muted-foreground">{isExpanded ? 'Hide' : 'Details'}</div>
                                              </div>
                                              {detail && <div className="text-xs text-muted-foreground mt-1 truncate">{detail}</div>}
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
                                              {generateExplanation(reason)}
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
                          <>
                            <CategoryPanel icon={<Link className="w-4 h-4" />} title="URLs" reasons={result.categorizedReasons.urls} />
                            <CategoryPanel icon={<Shield className="w-4 h-4" />} title="Brand" reasons={result.categorizedReasons.brand} />
                            <CategoryPanel icon={<FileText className="w-4 h-4" />} title="Content" reasons={(result.categorizedReasons as any).content} />
                            <CategoryPanel icon={<FileIcon className="w-4 h-4" />} title="Attachments" reasons={result.categorizedReasons.attachments} />
                            <CategoryPanel icon={<Brain className="w-4 h-4" />} title="Advanced" reasons={result.categorizedReasons.advanced} />
                            <CategoryPanel icon={<Shield className="w-4 h-4" />} title="Headers" reasons={result.categorizedReasons.headers} />
                            <CategoryPanel icon={<MoreHorizontal className="w-4 h-4" />} title="Others" reasons={result.categorizedReasons.other} />
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Individual Results Section for Multi-Analysis */}
                  {result.metadata?.individualResults && result.metadata.individualResults.length > 1 && (
                    <div className="mt-8 border-t border-border pt-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <List className="w-5 h-5 text-primary" />
                        Analysis Breakdown ({result.metadata.individualResults.length} items)
                      </h3>
                      <div className="grid gap-4">
                        {result.metadata.individualResults.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-r-2xl rounded-l-sm border-l-4 bg-secondary/5 border-border hover:bg-secondary/10 transition-all ${item.riskLevel === 'phishing' ? 'border-l-danger bg-danger/5 shadow-sm shadow-danger/10' :
                              item.riskLevel === 'suspicious' ? 'border-l-warning bg-warning/5 shadow-sm shadow-warning/10' :
                                'border-l-success bg-success/5 shadow-sm shadow-success/10'
                              }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${item.riskLevel === 'phishing' ? 'bg-danger/20 text-danger' :
                                    item.riskLevel === 'suspicious' ? 'bg-warning/20 text-warning' :
                                      'bg-success/20 text-success'
                                    }`}>
                                    {item.verdict}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">Score: {item.score}/100</span>
                                </div>
                                <div className="text-sm font-semibold truncate break-all text-foreground" title={item.item}>
                                  {item.item}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 md:max-w-[50%]">
                                {item.reasons.slice(0, 3).map((reason, rIdx) => (
                                  <span key={rIdx} className="text-[11px] bg-card px-2 py-1 rounded-md border border-border/50 text-muted-foreground whitespace-nowrap">
                                    {reason}
                                  </span>
                                ))}
                                {item.reasons.length > 3 && (
                                  <span className="text-[11px] text-muted-foreground self-center">+{item.reasons.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <SecurityRecommendation score={result.score} reasons={result.reasons} inputType={inputType} />
                </Card>

                {/* Data Visualization Components */}
                {showRadar && (
                  <div className="mt-6">
                    <SecurityRadarChart result={result} />
                  </div>
                )}

                <div className="mt-6">
                  <AnimatedBarChart result={result} />
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowHeatMap(!showHeatMap)}
                    className="w-full"
                  >
                    {showHeatMap ? 'Hide' : 'Show'} {inputType.charAt(0).toUpperCase() + inputType.slice(1)} Heat Map
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison Mode */}
          <AnimatePresence>
            {showComparison && (
              <ComparisonMode
                onClose={() => setShowComparison(false)}
                onAnalyze={performAnalysis}
                inputType={inputType}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <HistorySidebar
          history={history}
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onSelect={(item) => {
            switch (item.inputType) {
              case 'email':
                setEmailText(item.result.emailPreview || '');
                break;
              case 'url':
                setUrlText(item.inputContent);
                break;
              case 'ip':
                setIpText(item.inputContent);
                break;
              case 'domain':
                setDomainText(item.inputContent);
                break;
              case 'file':
                // For files, we can't restore the actual file object, but we can show the name
                setFile(null); // Reset file since we can't restore it
                break;
            }
            setInputType(item.inputType);
            setResult(item.result);
          }}
          onClear={() => {
            setHistory([]);
            toast.success('History cleared');
          }}
          useSidebarHistory={true}
        />

        <AnimatePresence>
          {quizOpen && (
            <QuizMode
              onClose={() => setQuizOpen(false)}
              onAchievement={handleQuizAchievement}
            />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </TooltipProvider>
  );
};
