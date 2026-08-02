import { useMemo } from 'react';
import { Globe } from 'lucide-react';
import { ThreatHeatMapCard, type HeatMapToken, type ThreatExplanation } from './ThreatHeatMapCard';
import type { PhishingResult } from '../types/phishing';

interface DomainHeatMapProps {
  domainText: string;
  result?: PhishingResult;
}

const suspiciousTld = /\.(?:tk|ml|ga|cf|gq|xyz|top|club|online|site|website|space|click|buzz|work|party|review|download|loan|win)$/i;
const brandRoots = ['paypal.com', 'amazon.com', 'microsoft.com', 'apple.com', 'google.com', 'facebook.com', 'instagram.com', 'netflix.com', 'linkedin.com', 'youtube.com', 'whatsapp.com', 'telegram.org', 'bkash.com', 'nagad.com.bd', 'daraz.com.bd'];
const brandNames = /(?:paypal|amazon|microsoft|apple|google|facebook|instagram|netflix|linkedin|youtube|whatsapp|telegram|bkash|nagad|daraz)/i;

const classifyDomain = (raw: string): HeatMapToken => {
  const value = raw.trim();
  const lower = value.toLowerCase().replace(/^[a-z][a-z\d+.-]*:\/\//, '').replace(/\/$/, '');
  if (!value) return { text: raw, intensity: 0 };
  if (/[^a-z0-9.-]/i.test(lower) || lower.startsWith('-') || lower.endsWith('-')) return { text: raw, intensity: 4, category: 'invalid_chars' };
  if (/(?:^|\.)xn--|[^\x00-\x7F]/i.test(lower)) return { text: raw, intensity: 4, category: 'homograph' };
  if (brandNames.test(lower) && !brandRoots.some(root => lower === root || lower.endsWith(`.${root}`))) return { text: raw, intensity: 4, category: 'brand_impersonation' };
  if (suspiciousTld.test(lower)) return { text: raw, intensity: 3, category: 'suspicious_tld' };
  if (lower.split('.').length > 4) return { text: raw, intensity: 2, category: 'deep_subdomain' };
  if (/\d{4,}/.test(lower)) return { text: raw, intensity: 2, category: 'numbers' };
  if (lower.length > 28) return { text: raw, intensity: 2, category: 'long_domain' };
  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(lower)) return { text: raw, intensity: 1, category: 'valid_domain' };
  return { text: raw, intensity: 0 };
};

const explanations: Record<string, ThreatExplanation> = {
  invalid_chars: { title: 'Invalid domain characters', description: 'The value contains characters that are not valid in a normal domain name.', tips: ['Check for copied punctuation or spaces', 'Do not open malformed links', 'Use the official domain typed manually'] },
  homograph: { title: 'Lookalike domain', description: 'Punycode or non-ASCII characters can make a fake domain resemble a trusted one.', tips: ['Check the exact spelling', 'Avoid unfamiliar internationalized domains', 'Use a saved bookmark for trusted services'] },
  brand_impersonation: { title: 'Brand impersonation', description: 'A familiar brand appears in a domain that is not one of its official domains.', tips: ['Read the final registrable domain', 'Do not trust a brand name in a subdomain', 'Verify through the official website'] },
  suspicious_tld: { title: 'Higher-risk domain extension', description: 'Some extensions are frequently abused and deserve additional verification.', tips: ['Confirm who owns the domain', 'Do not rely on HTTPS alone', 'Check reputation before signing in'] },
  deep_subdomain: { title: 'Deep subdomain structure', description: 'Many nested subdomains can hide the real organization that owns the domain.', tips: ['Read from the right side of the domain', 'Check the registrable domain', 'Be cautious of brand names in subdomains'] },
  numbers: { title: 'Unusual number pattern', description: 'Long numeric sequences can indicate generated or disposable domains.', tips: ['Verify the domain independently', 'Look for spelling and ownership clues', 'Avoid login pages on unfamiliar domains'] },
  long_domain: { title: 'Unusually long domain', description: 'Long domains can be used to hide confusing combinations or impersonation clues.', tips: ['Read the domain in sections', 'Check the final domain owner', 'Use a domain reputation service'] },
  valid_domain: { title: 'Low-risk domain structure', description: 'This domain has a valid structure and no strong local warning was found.', tips: ['Confirm the domain owner', 'Check the context where it appeared', 'Use official bookmarks for sensitive tasks'] }
};

export const DomainHeatMap = ({ domainText, result }: DomainHeatMapProps) => {
  const tokens = useMemo(() => domainText.split(/(\s+)/).map(classifyDomain), [domainText]);
  return (
    <ThreatHeatMapCard
      title="Domain Threat Heat Map"
      icon={<Globe className="h-5 w-5" />}
      tokens={tokens}
      result={result}
      itemLabel="suspicious elements"
      emptyMessage="Enter a domain to inspect its structure."
      getCategoryLabel={category => explanations[category]?.title || 'Domain indicator'}
      getThreatExplanation={category => explanations[category] || explanations.valid_domain}
    />
  );
};

