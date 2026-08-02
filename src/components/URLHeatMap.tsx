import { useMemo } from 'react';
import { Link } from 'lucide-react';
import { ThreatHeatMapCard, type HeatMapToken, type ThreatExplanation } from './ThreatHeatMapCard';
import type { PhishingResult } from '../types/phishing';

interface URLHeatMapProps {
  urlText: string;
  result?: PhishingResult;
}

const suspiciousTld = /\.(?:tk|ml|ga|cf|gq|xyz|top|club|online|site|website|space|click|buzz|work|party|review|download|loan|win)(?::\d+)?(?:[/?#]|$)/i;
const executable = /\.(?:exe|scr|js|vbs|bat|cmd|pif|jar)(?:[?#]|$)/i;
const doubleExtension = /\.(?:pdf|docx?|xlsx?|jpg|png)\.(?:exe|scr|js|vbs|bat|cmd)(?:[?#]|$)/i;
const knownBrand = /(?:paypal|amazon|microsoft|apple|google|facebook|instagram|netflix|linkedin|youtube|whatsapp|telegram|bkash|nagad|daraz)/i;
const officialBrandHost = /(?:^|\.)(?:paypal\.com|amazon\.com|microsoft\.com|apple\.com|google\.com|facebook\.com|instagram\.com|netflix\.com|linkedin\.com|youtube\.com|whatsapp\.com|telegram\.org|bkash\.com|nagad\.com\.bd|daraz\.com\.bd)(?::\d+)?$/i;

const classifyUrl = (raw: string): HeatMapToken => {
  const value = raw.trim();
  const lower = value.toLowerCase();
  const withoutScheme = lower.replace(/^[a-z][a-z\d+.-]*:\/\//i, '');
  const host = withoutScheme.split(/[/?#]/, 1)[0].replace(/:\d+$/, '');

  if (!value) return { text: raw, intensity: 0 };
  if (doubleExtension.test(lower)) return { text: raw, intensity: 4, category: 'double_extension' };
  if (executable.test(lower)) return { text: raw, intensity: 4, category: 'executable' };
  if (host.includes('@')) return { text: raw, intensity: 4, category: 'userinfo' };
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return { text: raw, intensity: 4, category: 'ip' };
  if (/(?:^|\.)xn--|[^\x00-\x7F]/i.test(host)) return { text: raw, intensity: 4, category: 'homograph' };
  if (knownBrand.test(host) && !officialBrandHost.test(host)) return { text: raw, intensity: 4, category: 'brand_impersonation' };
  if (/(?:bit\.ly|tinyurl\.com|goo\.gl|ow\.ly|t\.co|is\.gd|cutt\.ly|shorturl\.at)/i.test(host)) return { text: raw, intensity: 3, category: 'shortener' };
  if (suspiciousTld.test(host)) return { text: raw, intensity: 3, category: 'suspicious_tld' };
  if (/(?:login|signin|sign-in|verify|password|reset|unlock|auth|token|otp)/i.test(lower)) return { text: raw, intensity: 3, category: 'sensitive_params' };
  if (/(?:redirect|return|callback|next|url)=/i.test(lower)) return { text: raw, intensity: 3, category: 'redirect' };
  if (/^http:\/\//i.test(lower)) return { text: raw, intensity: 2, category: 'unencrypted' };
  if (value.length > 80) return { text: raw, intensity: 2, category: 'long_url' };
  if (/^(?:https?:\/\/|www\.)/i.test(value) || /^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(value)) return { text: raw, intensity: 1, category: 'valid_url' };
  return { text: raw, intensity: 0 };
};

const tokenizeUrl = (raw: string): HeatMapToken[] => {
  const base = classifyUrl(raw);
  const value = raw;
  if (!value.trim() || base.intensity === 0) return [base];

  const matches: Array<{ start: number; end: number; intensity: HeatMapToken['intensity']; category: string }> = [];
  const addMatch = (pattern: RegExp, intensity: HeatMapToken['intensity'], category: string) => {
    const match = pattern.exec(value);
    if (match && typeof match.index === 'number') {
      matches.push({ start: match.index, end: match.index + match[0].length, intensity, category });
    }
  };

  addMatch(/\.(?:pdf|docx?|xlsx?|jpg|png)\.(?:exe|scr|js|vbs|bat|cmd)(?=[?#]|$)/i, 4, 'double_extension');
  addMatch(/\.(?:exe|scr|js|vbs|bat|cmd|pif|jar)(?=[?#]|$)/i, 4, 'executable');
  addMatch(/(?:\d{1,3}\.){3}\d{1,3}/, 4, 'ip');
  addMatch(/[^/\s@]+@/i, 4, 'userinfo');
  addMatch(/(?:^|\/)(?:xn--[a-z0-9-]+|[a-z0-9-]*[^\x00-\x7F][a-z0-9-]*)/i, 4, 'homograph');
  if (base.category === 'brand_impersonation') {
    addMatch(/(?:paypal|amazon|microsoft|apple|google|facebook|instagram|netflix|linkedin|youtube|whatsapp|telegram|bkash|nagad|daraz)/i, 4, 'brand_impersonation');
  }
  addMatch(/(?:bit\.ly|tinyurl\.com|goo\.gl|ow\.ly|t\.co|is\.gd|cutt\.ly|shorturl\.at)/i, 3, 'shortener');
  addMatch(/\.(?:tk|ml|ga|cf|gq|xyz|top|club|online|site|website|space|click|buzz|work|party|review|download|loan|win)(?::\d+)?(?=[/?#]|$)/i, 3, 'suspicious_tld');
  addMatch(/(?:login|signin|sign-in|verify|password|reset|unlock|auth|token|otp)/i, 3, 'sensitive_params');
  addMatch(/(?:redirect|return|callback|next|url)(?==)/i, 3, 'redirect');
  addMatch(/^http:\/\//i, 2, 'unencrypted');

  if (matches.length === 0) return [{ ...base, intensity: Math.min(base.intensity, 2) as HeatMapToken['intensity'] }];

  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const segments: HeatMapToken[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue;
    if (match.start > cursor) segments.push({ text: value.slice(cursor, match.start), intensity: 1, category: 'valid_url' });
    segments.push({ text: value.slice(match.start, match.end), intensity: match.intensity, category: match.category });
    cursor = match.end;
  }
  if (cursor < value.length) segments.push({ text: value.slice(cursor), intensity: 1, category: 'valid_url' });
  return segments;
};

const explanations: Record<string, ThreatExplanation> = {
  double_extension: { title: 'Double extension', description: 'The download uses a document-looking extension before an executable extension, a common disguise.', tips: ['Do not open the file', 'Verify the sender through another channel', 'Scan downloads before opening them'] },
  executable: { title: 'Executable download', description: 'Executable files can install software or run code when opened.', tips: ['Avoid opening executable downloads from messages', 'Use a trusted malware scanner', 'Get software from the official publisher'] },
  userinfo: { title: 'Hidden destination before @', description: 'Text before @ can look trustworthy while the browser connects to the host after it.', tips: ['Read the hostname after @', 'Do not rely on the visible brand name', 'Close the page if the destination is unexpected'] },
  ip: { title: 'IP-based URL', description: 'The link uses an IP address instead of a recognizable domain, which is unusual for trusted services.', tips: ['Verify the destination independently', 'Avoid login pages hosted on raw IPs', 'Use the company’s official site directly'] },
  homograph: { title: 'Lookalike hostname', description: 'Punycode or non-ASCII characters can make a fake hostname resemble a trusted one.', tips: ['Check the exact spelling of the host', 'Avoid unfamiliar internationalized domains', 'Open the official site from a saved bookmark'] },
  brand_impersonation: { title: 'Brand impersonation', description: 'A known brand appears on a hostname that is not owned by that brand.', tips: ['Check the registrable domain at the end of the hostname', 'Never sign in from an unexpected link', 'Use the official app or website'] },
  shortener: { title: 'URL shortener', description: 'A shortened link hides the final destination and makes verification harder.', tips: ['Expand the link before opening it', 'Be cautious with shortened links from unknown senders', 'Verify the sender and context'] },
  suspicious_tld: { title: 'Higher-risk domain extension', description: 'Some free or frequently abused extensions deserve extra verification.', tips: ['Check the organization behind the domain', 'Do not treat HTTPS alone as proof of safety', 'Use a reputation lookup for important links'] },
  sensitive_params: { title: 'Credential-related path', description: 'The link appears designed for login, verification, password reset, or token collection.', tips: ['Navigate to the official site manually', 'Never enter passwords from an email link', 'Check the hostname before continuing'] },
  redirect: { title: 'Redirect parameter', description: 'Redirect parameters can send you to a different destination after the first page.', tips: ['Inspect the full URL carefully', 'Avoid entering credentials after redirects', 'Use a trusted URL scanner'] },
  unencrypted: { title: 'Unencrypted HTTP', description: 'HTTP does not protect the connection in transit and should not be used for sensitive actions.', tips: ['Prefer HTTPS', 'Never submit passwords over HTTP', 'Verify the domain independently'] },
  long_url: { title: 'Unusually long URL', description: 'Long links can hide redirects, encoded content, or confusing paths.', tips: ['Read the hostname first', 'Look for redirect and tracking parameters', 'Use a trusted scanner for unknown links'] },
  valid_url: { title: 'Low-risk URL structure', description: 'This link has a recognizable URL structure and no strong local warning was found.', tips: ['Confirm the sender and context', 'Check the hostname before clicking', 'HTTPS is helpful but not proof by itself'] }
};

export const URLHeatMap = ({ urlText, result }: URLHeatMapProps) => {
  const tokens = useMemo(() => urlText.split(/(\s+)/).flatMap(tokenizeUrl), [urlText]);
  return (
    <ThreatHeatMapCard
      title="URL Threat Heat Map"
      icon={<Link className="h-5 w-5" />}
      tokens={tokens}
      result={result}
      itemLabel="suspicious elements"
      emptyMessage="Enter a URL to inspect its structure."
      getCategoryLabel={category => explanations[category]?.title || 'URL indicator'}
      getThreatExplanation={category => explanations[category] || explanations.valid_url}
    />
  );
};
