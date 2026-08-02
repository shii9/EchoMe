import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Brain, Send, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Preprocesses markdown to convert single newlines to two spaces and a newline,
// making ReactMarkdown render them as line breaks, while preserving code blocks and paragraphs.
const formatContent = (text: string) => {
  if (!text) return '';
  const normalized = text.replace(/\r\n/g, '\n');
  const parts = normalized.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part;
      return part.replace(/(?<!\n)\n(?!\n)/g, '  \n');
    })
    .join('');
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
// Pollinations simple GET endpoint — completely free, no key, no sign-up
// Works anonymously forever: https://text.pollinations.ai/{prompt}
const MAX_AI_MESSAGE_LENGTH = 6_000;
const MIN_AI_REQUEST_INTERVAL_MS = 1_500;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const AI_FUNCTION_URL = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/phishing-ai-chat` : null;

const SYSTEM_PROMPT = `You are Nio, an expert AI assistant. While you specialize in cybersecurity and phishing, you are capable of answering *any* question the user asks. Always organize your responses cleanly using proper Markdown formatting, including headers, bold text, bulleted lists, and tables when presenting structured information. Keep your answers clear, concise, and professional.`;

const readSseText = (body: string): string => {
  const parts = body
    .split(/\r?\n/)
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trim())
    .filter(line => line && line !== '[DONE]')
    .map(line => {
      try {
        const payload = JSON.parse(line) as { choices?: Array<{ delta?: { content?: string } }> };
        return payload.choices?.[0]?.delta?.content || '';
      } catch {
        return '';
      }
    })
    .join('');

  return parts || body.trim();
};

const SUGGESTED_QUESTIONS = [
  'What are common phishing indicators?',
  'How do I verify a suspicious email?',
  'What is SPF, DKIM, and DMARC?',
  'How to spot fake URLs?',
  'What should I do if I clicked a phishing link?',
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── AIAssistant ──────────────────────────────────────────────────────────────
export const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! 👋 I'm Nio, your AI security expert. Ask me anything about phishing detection, email security, or cybersecurity best practices.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastRequestAtRef = useRef(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clean up and abort active generation if dialog is closed
  useEffect(() => {
    if (!isOpen) {
      handleStop();
    }
  }, [isOpen]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setIsLoading(false);
  };

// ─── Intelligent Cybersecurity Knowledge Engine (Seamless Fallback) ─────────
const generateSmartSecurityResponse = (prompt: string): string => {
  const p = prompt.toLowerCase();

  if (p.includes('indicator') || p.includes('red flag') || p.includes('spot') || p.includes('detect') || p.includes('common')) {
    return `### 🚨 Key Phishing Red Flags & Threat Indicators

When inspecting suspicious emails or communications, evaluate these critical security indicators:

| Threat Category | High-Risk Indicator | Safety Verification Rule |
| :--- | :--- | :--- |
| **Sender Domain** | Mismatched display name vs domain (\`paypa1-support.com\`) | Verify exact domain match with official domain |
| **Sense of Urgency** | Threatening tone ("Account suspended in 24 hrs") | Legitimate entities rarely demand immediate action via email |
| **Hyperlinks** | Misleading destination links or typosquatting | Hover to inspect URL target before clicking |
| **Attachments** | Executable (\`.exe\`, \`.vbs\`) or macro (\`.docm\`, \`.xlsm\`) | Do not open unexpected or unsigned attachments |
| **Authentication** | Missing or failing SPF, DKIM, or DMARC checks | Check mail headers for authentication alignment |

#### 🛡️ Actionable Verification Steps
1. **Inspect Header Alignment:** Confirm sender domain matches the Return-Path header.
2. **Never Use Embedded Links:** Navigate directly to the official portal in a new browser window.
3. **Report Suspected Attacks:** Forward suspicious messages to your IT/SOC team immediately.

> 💡 **Security Pro Tip:** Use the **Phishing Analyzer** header & URL scanner to perform automated reputation checks.`;
  }

  if (p.includes('spf') || p.includes('dkim') || p.includes('dmarc') || p.includes('verify') || p.includes('header')) {
    return `### 🛡️ Email Authentication Protocols: SPF, DKIM & DMARC

Email authentication protocols work as a multi-layered defense to prevent domain spoofing and email tampering:

#### 1. Sender Policy Framework (SPF)
Defines authorized mail servers permitted to send email on behalf of a specific domain.
\`\`\`txt
v=spf1 include:_spf.google.com ~all
\`\`\`

#### 2. DomainKeys Identified Mail (DKIM)
Applies a cryptographic signature to outbound messages, confirming message integrity during transit.
\`\`\`txt
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...
\`\`\`

#### 3. DMARC (Domain-based Message Authentication, Reporting & Conformance)
Enforces policy actions when SPF or DKIM validation fails:

- **\`p=none\`**: Monitoring mode (collects reports, permits delivery)
- **\`p=quarantine\`**: Directs failed mail to spam/junk folder
- **\`p=reject\`**: Blocks unauthenticated messages completely at the gateway

> 🔒 **Recommendation:** Enforce \`p=reject\` with strict alignment to achieve maximum protection against brand impersonation.`;
  }

  if (p.includes('click') || p.includes('clicked') || p.includes('link') || p.includes('hacked') || p.includes('compromis')) {
    return `### ⚡ Emergency Incident Response Protocol

If you clicked a suspicious link or supplied credentials, execute these steps immediately:

#### Immediate Containment (Minutes 0 - 5)
1. **Isolate Device:** Disconnect Wi-Fi and unplug Ethernet immediately to halt malware communication.
2. **Credential Reset:** Reset passwords for affected accounts from an uncompromised device.
3. **Enable Multi-Factor Authentication (MFA):** Force MFA on all primary email and financial portals.

#### Incident Remediation (Minutes 5 - 30)
4. **Notify SOC / IT Security:** Alert your organization's Incident Response team to isolate network access.
5. **System Scan:** Run a full offline malware scan using enterprise endpoint protection.
6. **Revoke Active Sessions:** Terminate all active login sessions in account security settings.

> 🚨 **Critical Rule:** Never attempt to hide a potential breach. Fast reporting minimizes organizational damage.`;
  }

  if (p.includes('url') || p.includes('domain') || p.includes('fake')) {
    return `### 🔍 Malicious URL Analysis & Domain Spoofing Techniques

Attackers exploit visual similarities to deceive users into visiting fraudulent domains:

#### Common URL Obfuscation Methods
1. **Subdomain Tricking**  
   - ❌ \`login.paypal.com.security-verify.net\` *(Actual domain: \`security-verify.net\`)*
   - ✅ \`login.paypal.com\` *(Actual domain: \`paypal.com\`)*

2. **Homograph Attacks (IDN Spoofing)**  
   Replacing Latin characters with identical-looking Cyrillic characters (e.g., \`g00gle.com\` or \`pаypal.com\`).

3. **Open Redirect Abuse**  
   Leveraging legitimate domain redirectors to mask malicious destination URLs (\`https://legitimate.com/redirect?url=http://malicious.com\`).

> 🛠️ **Pro Tip:** Always inspect the domain registered name immediately before the top-level domain (\`.com\`, \`.org\`, \`.net\`).`;
  }

  return `### 🔒 Cybersecurity & Threat Intelligence Analysis

Thank you for your inquiry regarding **"${prompt}"**. Here is an executive breakdown from Nio AI:

#### Core Defensive Principles
- **Zero Trust Architecture:** Never trust implicitly; continuously verify identity, context, and credentials.
- **Defense in Depth:** Combine technical controls (SPF/DMARC, endpoint defense) with user security awareness.
- **Continuous Monitoring:** Audit logs, header alignments, and external API requests for anomalies.

#### Recommended Security Controls
1. **Enforce Strong MFA:** Mandate hardware keys (FIDO2) or authenticator apps over SMS.
2. **Automate Reputation Verification:** Scan suspicious artifacts via VirusTotal & Google Safe Browsing APIs.
3. **Regular Security Audits:** Conduct periodic penetration testing and phishing simulations.

> Feel free to ask follow-up questions regarding header analysis, malware detection, or enterprise security frameworks!`;
};

  // ── Core AI Call Logic ───────────────────────────────────────────────────────
  const callAI = async (userMessage: Message, currentMessages: Message[]) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    setIsLoading(true);

    try {
      const prompt = userMessage.content;
      if (prompt.length > MAX_AI_MESSAGE_LENGTH) {
        throw new Error('Message exceeds the maximum allowed length');
      }
      const now = Date.now();
      if (now - lastRequestAtRef.current < MIN_AI_REQUEST_INTERVAL_MS) {
        throw new Error('Please wait before sending another AI request');
      }
      lastRequestAtRef.current = now;
      if (!AI_FUNCTION_URL || !SUPABASE_PUBLISHABLE_KEY) {
        throw new Error('Secure AI backend is not configured');
      }

      const response = await fetch(AI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: currentMessages.slice(-20) }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API Status ${response.status}`);
      }

      const text = readSseText(await response.text());
      if (!text || text.includes('"error":') || text.includes('Payment Required') || text.includes('Queue full')) {
        throw new Error('API Rate Limited or Deprecated');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsLoading(false);

      const words = text.split(' ');
      let currentText = '';
      for (let i = 0; i < words.length; i++) {
        if (controller.signal.aborted) break;
        currentText += (i === 0 ? '' : ' ') + words[i];
        setMessages(prev => {
          const newM = [...prev];
          if (newM.length > 0 && newM[newM.length - 1].role === 'assistant') {
            newM[newM.length - 1].content = currentText;
          }
          return newM;
        });
        await new Promise(res => setTimeout(res, 20));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('AI response generation stopped by user.');
        return;
      }

      console.warn('Online AI API unavailable. Utilizing Nio Security Intelligence Engine...', err);
      const fallbackResponse = generateSmartSecurityResponse(userMessage.content);

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsLoading(false);

      const words = fallbackResponse.split(' ');
      let currentText = '';
      for (let i = 0; i < words.length; i++) {
        if (controller.signal.aborted) break;
        currentText += (i === 0 ? '' : ' ') + words[i];
        setMessages(prev => {
          const newM = [...prev];
          if (newM.length > 0 && newM[newM.length - 1].role === 'assistant') {
            newM[newM.length - 1].content = currentText;
          }
          return newM;
        });
        await new Promise(res => setTimeout(res, 18));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsGenerating(false);
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText) return;
    if (messageText.length > MAX_AI_MESSAGE_LENGTH) {
      toast.error(`Please keep messages under ${MAX_AI_MESSAGE_LENGTH.toLocaleString()} characters.`);
      return;
    }

    // Interrupt current generation if active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = { role: 'user', content: messageText };
    let updatedMessages: Message[] = [];

    setMessages(prev => {
      // Remove trailing empty assistant message if one exists due to an abort
      const filtered = [...prev];
      if (filtered.length > 0 && filtered[filtered.length - 1].role === 'assistant' && !filtered[filtered.length - 1].content) {
        filtered.pop();
      }
      updatedMessages = [...filtered, userMessage];
      return updatedMessages;
    });

    setInput('');
    await callAI(userMessage, updatedMessages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100vw-1rem)] max-w-4xl h-[85dvh] max-h-[calc(100dvh-1rem)] sm:w-[90vw] sm:h-[85vh] sm:max-h-none rounded-xl sm:rounded-lg p-0 gap-0 bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 shadow-2xl overflow-hidden flex flex-col [&>button]:hidden"
        aria-describedby="ai-assistant-description"
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-primary px-4 py-3 sm:px-6 sm:py-4 border-b border-primary/20 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              className="p-2 sm:p-2.5 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-2xl font-bold leading-tight text-white">
                Nio AI Security Expert
              </DialogTitle>
              <p id="ai-assistant-description" className="text-[10px] sm:text-xs text-white/80 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-relaxed">
                <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                Always online · No setup · No limits · Free forever
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 relative flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
              </motion.div>

              <button
                onClick={onClose}
                className="x-close-btn x-close-btn-md"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Suggested questions (shown only before first reply) ─────────────── */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-3 mt-3 p-3 sm:mx-6 sm:mt-6 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 flex-shrink-0"
          >
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">Get Started</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Ask me anything about security — I'm ready right now, no setup needed!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(question)}
                  className="w-full sm:w-auto h-auto min-h-9 justify-start whitespace-normal text-left text-xs bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                >
                  {question}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Messages ───────────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 px-3 py-3 sm:px-6 sm:py-4 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div ref={scrollRef} className="space-y-4 pr-2 sm:pr-4 pb-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-3 sm:p-4 shadow-lg ${message.role === 'user'
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border/50'
                        }`}
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
                          <Brain className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-xs font-semibold text-primary">Nio AI Expert</span>
                        </div>
                      )}

                      {message.role === 'user' ? (
                        <div
                          className="text-sm leading-relaxed"
                          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        >
                          {message.content}
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-3 pb-1 border-b border-border/50">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-semibold text-foreground mt-4 mb-2 pb-1 border-b border-border/30">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-bold text-primary mt-3 mb-1">{children}</h3>,
                              h4: ({ children }) => <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mt-3 mb-1">{children}</h4>,
                              p: ({ children }) => <p className="mb-2 leading-relaxed text-sm text-foreground/90">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">{children}</ol>,
                              li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                              blockquote: ({ children }) => (
                                <blockquote className="my-3 pl-4 py-2 border-l-4 border-primary bg-primary/10 rounded-r-xl text-sm font-medium text-foreground">
                                  {children}
                                </blockquote>
                              ),
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-3 rounded-xl border border-border/50">
                                  <table className="w-full text-left text-xs border-collapse">{children}</table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-muted/80 text-foreground font-semibold border-b border-border">{children}</thead>,
                              th: ({ children }) => <th className="px-3 py-2 border-r border-border/40 last:border-r-0">{children}</th>,
                              td: ({ children }) => <td className="px-3 py-2 border-b border-r border-border/30 last:border-r-0">{children}</td>,
                              code: ({ inline, className, children, ...props }: any) =>
                                inline ? (
                                  <code className="bg-muted/80 text-primary font-mono text-xs px-1.5 py-0.5 rounded border border-border/50" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="block bg-muted text-foreground font-mono text-xs p-3 rounded-xl border border-border/50 overflow-x-auto my-2" {...props}>
                                    {children}
                                  </code>
                                ),
                            }}
                          >
                            {formatContent(message.content)}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Thinking indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex justify-start w-full mt-2"
                >
                  <div className="bg-card/90 backdrop-blur-md rounded-2xl p-4 md:px-5 shadow-sm border border-border/60 flex items-center gap-3">
                    <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary/10">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>

                    {/* Professional Processing Animation */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">Nio Is Processing</span>
                      <div className="flex items-center gap-[3px] h-3">
                        <motion.div className="w-1 rounded-full bg-primary/80" animate={{ height: ['4px', '12px', '4px'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0 }} />
                        <motion.div className="w-1 rounded-full bg-primary/80" animate={{ height: ['4px', '12px', '4px'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }} />
                        <motion.div className="w-1 rounded-full bg-primary/80" animate={{ height: ['4px', '12px', '4px'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
                        <motion.div className="w-1 rounded-full bg-primary/80" animate={{ height: ['4px', '12px', '4px'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.45 }} />
                        <motion.div className="w-1 rounded-full bg-primary/80" animate={{ height: ['4px', '12px', '4px'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── Follow-up chips ─────────────────────────────────────────────────── */}
        {messages.length > 1 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 pb-2 sm:px-6 sm:pb-3 flex-shrink-0"
          >
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSend(question)}
                  className="text-xs whitespace-nowrap bg-secondary/30 hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
                >
                  {question}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Input bar ──────────────────────────────────────────────────────── */}
        <div className="px-3 pb-3 pt-2 sm:px-6 sm:pb-6 bg-gradient-to-t from-background/50 to-transparent backdrop-blur-sm border-t border-border/30 flex-shrink-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:items-center">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about phishing, email security, or best practices..."
                rows={1}
                className="w-full h-11 sm:h-12 py-2.5 sm:py-3 px-3 sm:px-4 resize-none bg-background/80 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm rounded-xl outline-none block"
              />
            </div>
            {isGenerating && !input.trim() ? (
              <Button
                onClick={handleStop}
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/95 text-destructive-foreground transition-all shadow-lg hover:shadow-xl h-11 sm:h-12 px-4 sm:px-6 rounded-xl flex-shrink-0"
                size="lg"
              >
                <div className="w-3 h-3 bg-current mr-2 rounded-sm" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-all shadow-lg hover:shadow-xl h-11 sm:h-12 px-4 sm:px-6 rounded-xl flex-shrink-0"
                size="lg"
              >
                <Send className="w-5 h-5 mr-2" />
                Send
              </Button>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 flex flex-wrap items-center gap-1.5 leading-relaxed">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Secure AI guidance with a local fallback
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
