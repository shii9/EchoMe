/**
 * Shared, deterministic phishing signals.
 *
 * This module deliberately uses conservative heuristics. A URL being unknown,
 * long, or hosted on a newer TLD is not enough to call it phishing by itself;
 * stronger signals are combined before the score becomes high.
 */

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly',
  'buff.ly', 'tiny.cc', 'v.gd', 'tr.im', 'lnkd.in', 'shorturl.at', 'tiny.one',
  'short.io', 'rebrand.ly', 'bl.ink', 'bit.do'
]);

const SUSPICIOUS_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'club', 'online', 'site',
  'website', 'space', 'click', 'buzz', 'work', 'party', 'review', 'science',
  'download', 'trade', 'bid', 'webcam', 'loan', 'win', 'faith', 'racing',
  'accountant', 'casino', 'poker', 'bet', 'blackjack', 'roulette', 'adult', 'xxx'
]);

const OFFICIAL_ROOTS = {
  paypal: ['paypal.com'],
  amazon: ['amazon.com', 'amazon.com.bd', 'amazonaws.com'],
  microsoft: ['microsoft.com', 'live.com', 'office.com', 'outlook.com', 'microsoftonline.com', 'azure.com', 'windows.net'],
  apple: ['apple.com', 'icloud.com'],
  google: ['google.com', 'gmail.com', 'googleapis.com', 'googleusercontent.com', 'gstatic.com'],
  facebook: ['facebook.com', 'fb.com', 'facebook.net', 'fbcdn.net', 'instagram.com'],
  instagram: ['instagram.com'],
  netflix: ['netflix.com'],
  linkedin: ['linkedin.com'],
  youtube: ['youtube.com'],
  whatsapp: ['whatsapp.com'],
  telegram: ['telegram.org'],
  github: ['github.com', 'github.io'],
  bKash: ['bkash.com'],
  nagad: ['nagad.com.bd'],
  daraz: ['daraz.com.bd', 'daraz.com'],
  slack: ['slack.com'],
  discord: ['discord.com']
};

const URL_PATTERN = /\b(?:(?:https?|ftp):\/\/|www\.)[^\s<>"'`]+|(?<![@\w])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"'`]*)?/giu;
const IP_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const SENSITIVE_WORDS = /(?:password|passcode|passwd|pin|otp|one[- ]time code|ssn|social security|nid|credit card|card number|cvv|bank account|mobile money|security answer)/i;
const REQUEST_WORDS = /(?:enter|provide|send|share|submit|confirm|verify|update|reply with|click|type|upload)/i;
const URGENCY_WORDS = /(?:urgent|immediately|immediate action|act now|within \d+ hours?|expires? (?:today|soon)|suspended|locked|final notice|last warning)/i;

function addSignal(state, points, message, category, strong = false) {
  const signal = { points, message, category, strong };
  state.signals.push(signal);
  state.score += points;
  state.reasons.push(message);
  const bucket = state.categorizedReasons[category] || state.categorizedReasons.other;
  bucket.push(message);
  if (category === 'urls') state.urlIssues += 1;
  if (category === 'brand') state.brandImpersonation = true;
}

function cleanCandidate(value) {
  return value.replace(/[),.;!?]+$/g, '').trim();
}

export function extractUrls(text) {
  return [...new Set((text.match(URL_PATTERN) || []).map(cleanCandidate))];
}

function isValidIp(hostname) {
  return IP_PATTERN.test(hostname) && hostname.split('.').every(part => Number(part) <= 255);
}

function officialHostForBrand(hostname, brand) {
  return OFFICIAL_ROOTS[brand].some(root => hostname === root || hostname.endsWith(`.${root}`));
}

function getTld(hostname) {
  const labels = hostname.split('.');
  return labels.length > 1 ? labels[labels.length - 1] : '';
}

function parseUrl(raw) {
  const value = raw.trim();
  const authority = value.replace(/^[a-z][a-z\d+.-]*:\/\//i, '').split(/[/?#]/, 1)[0];
  const hasUserInfo = authority.includes('@');
  const parseValue = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(parseValue);
    return {
      parsed,
      hostname: parsed.hostname.toLowerCase().replace(/\.$/, ''),
      hasUserInfo,
      protocol: parsed.protocol.toLowerCase(),
      value
    };
  } catch {
    return null;
  }
}

function scanUrl(state, raw, options = {}) {
  const parsedUrl = parseUrl(raw);
  if (!parsedUrl) {
    addSignal(state, 12, `Malformed URL structure: ${raw}`, 'urls');
    return { score: 12, hostname: '' };
  }

  const { parsed, hostname, hasUserInfo, protocol, value } = parsedUrl;
  const pathAndQuery = `${parsed.pathname}${parsed.search}`.toLowerCase();
  let itemScore = 0;
  const itemSignals = [];

  const addUrlSignal = (points, message, category = 'urls', strong = false) => {
    itemScore += points;
    itemSignals.push(message);
    if (!options.collectOnly) addSignal(state, points, `${message}: ${raw}`, category, strong);
  };

  const ipHost = isValidIp(hostname);
  if (ipHost) addUrlSignal(30, 'Direct IP address used instead of a domain', 'urls', true);
  if (protocol === 'http:') addUrlSignal(8, 'Unencrypted HTTP connection', 'headers');
  if (SHORTENERS.has(hostname)) addUrlSignal(18, 'URL shortener hides the final destination', 'urls');
  if (hasUserInfo) addUrlSignal(50, 'Username-like text before @ hides the real host', 'advanced', true);
  if (hostname.startsWith('xn--') || hostname.includes('xn--')) {
    addUrlSignal(25, 'Punycode hostname may conceal a lookalike domain', 'advanced', true);
  }
  if (/[^\x00-\x7F]/.test(hostname)) {
    addUrlSignal(25, 'Non-ASCII hostname may be a homograph lookalike', 'advanced', true);
  }

  const tld = getTld(hostname);
  if (SUSPICIOUS_TLDS.has(tld)) addUrlSignal(15, `Higher-risk top-level domain (.${tld})`, 'urls');

  const hostLabels = hostname.split('.');
  const subdomainCount = Math.max(0, hostLabels.length - 2);
  if (subdomainCount > 3) addUrlSignal(10, 'Excessive subdomain depth', 'urls');
  if (value.length > 180) addUrlSignal(5, 'Unusually long URL', 'advanced');

  for (const brand of Object.keys(OFFICIAL_ROOTS)) {
    const normalizedBrand = brand.toLowerCase();
    if (hostname.includes(normalizedBrand) && !officialHostForBrand(hostname, brand)) {
      addUrlSignal(45, `Brand name appears on an unofficial hostname (${brand})`, 'brand', true);
      break;
    }
  }

  const credentialPath = /(?:login|log-in|signin|sign-in|verify|authentication|password|reset|unlock|secure)/i.test(pathAndQuery);
  const sensitiveQuery = /(?:password|passwd|passcode|pin|otp|token|session|cvv|card|ssn|nid|account|auth)=?/i.test(parsed.search);
  if (credentialPath && !isTrustedHost(hostname)) addUrlSignal(12, 'Credential or account action on an untrusted host', 'context');
  if (sensitiveQuery) addUrlSignal(12, 'Sensitive credential parameter in URL', 'context', true);
  if (/(?:redirect|return|callback|next|url)=/i.test(parsed.search)) addUrlSignal(8, 'Redirect parameter can hide the final destination', 'advanced');
  if (/%(?:[0-9a-f]{2}){8,}/i.test(pathAndQuery)) addUrlSignal(8, 'Heavily encoded URL content', 'advanced');
  if (/(?:\.(?:exe|scr|js|vbs|bat|cmd))(?:$|[?#])/i.test(parsed.pathname)) addUrlSignal(32, 'Executable file requested from URL', 'attachments', true);
  if (/(?:\.(?:pdf|docx?|xlsx?|jpg|png))\.(?:exe|scr|js|vbs|bat|cmd)(?:$|[?#])/i.test(parsed.pathname)) {
    addUrlSignal(28, 'Double extension disguises an executable download', 'attachments', true);
  }

  return { score: Math.min(itemScore, 100), hostname, tld, protocol, subdomainCount, itemSignals };
}

function isTrustedHost(hostname) {
  return Object.values(OFFICIAL_ROOTS).some(roots => roots.some(root => hostname === root || hostname.endsWith(`.${root}`))) ||
    ['example.com', 'example.org', 'example.net'].some(root => hostname === root || hostname.endsWith(`.${root}`));
}

function scanEmail(state, text) {
  const lowerText = text.toLowerCase();
  const urls = extractUrls(text);
  for (const url of urls) scanUrl(state, url);

  const hasSensitiveRequest = REQUEST_WORDS.test(text) && SENSITIVE_WORDS.test(text);
  if (hasSensitiveRequest) {
    state.sensitiveRequests += 1;
    addSignal(state, 18, 'Message asks the recipient to provide sensitive information', 'context', true);
  }
  if (URGENCY_WORDS.test(text)) addSignal(state, 8, 'Urgent or threatening language pressures the recipient', 'context');
  if (REQUEST_WORDS.test(text) && urls.length > 0) addSignal(state, 10, 'Call to action is paired with a link', 'context');
  if (URGENCY_WORDS.test(text) && urls.length > 0) addSignal(state, 12, 'Urgency is paired with a link', 'context', true);
  if (/\b(?:dear|hello)\s+(?:customer|user|client|sir|madam|winner)\b/i.test(text)) {
    addSignal(state, 5, 'Generic greeting does not personalize the message', 'context');
  }
  if (/\p{Cf}/u.test(text)) addSignal(state, 18, 'Invisible formatting characters may hide text', 'advanced', true);

  const dangerousAttachment = /\.(?:exe|scr|js|vbs|bat|cmd|pif|jar)(?:\b|$)/i.test(text);
  const macroAttachment = /\.(?:docm|xlsm|pptm)(?:\b|$)/i.test(text);
  const disguisedAttachment = /\.(?:pdf|docx?|xlsx?|jpg|png)\s*\.(?:exe|scr|js|vbs|bat|cmd)\b/i.test(text);
  if (dangerousAttachment) addSignal(state, 30, 'Executable attachment is referenced', 'attachments', true);
  if (macroAttachment) addSignal(state, 22, 'Macro-enabled Office attachment is referenced', 'attachments', true);
  if (disguisedAttachment) addSignal(state, 28, 'Attachment uses a double extension to disguise its type', 'attachments', true);

  const from = text.match(/(?:^|\n)from:\s*[^<\n]*<?([^>\s]+@[^>\s]+)>?/i)?.[1];
  const replyTo = text.match(/(?:^|\n)reply-to:\s*[^<\n]*<?([^>\s]+@[^>\s]+)>?/i)?.[1];
  if (from && replyTo && from.split('@')[1]?.toLowerCase() !== replyTo.split('@')[1]?.toLowerCase()) {
    addSignal(state, 20, 'From and Reply-To domains do not match', 'headers', true);
  }
}

function scanIp(state, text) {
  for (const raw of text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) {
    if (!isValidIp(raw)) continue;
    const parts = raw.split('.').map(Number);
    const privateIp = parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168);
    const reservedIp = parts[0] === 0 || (parts[0] === 127) || (parts[0] === 169 && parts[1] === 254) || parts[0] >= 224;
    if (privateIp) addSignal(state, 25, 'Private network IP is not a public service address', 'advanced');
    else if (reservedIp) addSignal(state, 20, 'Reserved or local IP range detected', 'advanced');
  }
}

function scanDomain(state, text) {
  for (const raw of text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) {
    scanUrl(state, raw, { domainOnly: true });
  }
}

function scanFile(state, text, fileName) {
  const value = fileName || text;
  if (!value) return;
  if (/\.(?:exe|scr|js|vbs|bat|cmd|pif|jar)$/i.test(value)) addSignal(state, 45, 'Executable file type detected', 'attachments', true);
  if (/\.(?:docm|xlsm|pptm)$/i.test(value)) addSignal(state, 28, 'Macro-enabled Office file detected', 'attachments', true);
  if (/\.(?:pdf|docx?|xlsx?|jpg|png)\.(?:exe|scr|js|vbs|bat|cmd)$/i.test(value)) addSignal(state, 30, 'Double extension disguises an executable file', 'advanced', true);
  if (/\.(?:zip|7z|rar|iso|img|dmg)$/i.test(value)) addSignal(state, 12, 'Archive or disk image can contain hidden executables', 'attachments');
}

export function scanPhishingInput(text, inputType, fileName = '') {
  const state = {
    score: 0,
    reasons: [],
    categorizedReasons: { urls: [], brand: [], grammar: [], content: [], attachments: [], advanced: [], headers: [], context: [], other: [] },
    keywordMatches: 0,
    urlIssues: 0,
    sensitiveRequests: 0,
    brandImpersonation: false,
    signals: []
  };

  const value = String(text || '');
  if (inputType === 'email') scanEmail(state, value);
  if (inputType === 'url') for (const raw of value.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) scanUrl(state, raw);
  if (inputType === 'domain') scanDomain(state, value);
  if (inputType === 'ip') scanIp(state, value);
  if (inputType === 'file') scanFile(state, value, fileName);

  state.keywordMatches = state.signals.filter(signal => signal.category === 'context' || signal.category === 'content').length;
  state.score = Math.min(Math.round(state.score), 100);
  return {
    ...state,
    confidence: Math.min(96, 55 + state.signals.length * 6 + (state.signals.some(signal => signal.strong) ? 10 : 0))
  };
}
