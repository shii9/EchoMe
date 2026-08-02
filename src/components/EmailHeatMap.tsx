import { useMemo } from 'react';
import { Mail } from 'lucide-react';
import { ThreatHeatMapCard, type HeatMapToken, type ThreatExplanation } from './ThreatHeatMapCard';
import type { PhishingResult } from '../types/phishing';

interface EmailHeatMapProps {
  emailText: string;
  result?: PhishingResult;
}

const classifyEmailToken = (raw: string): HeatMapToken => {
  const value = raw.trim();
  const lower = value.toLowerCase();
  if (!value) return { text: raw, intensity: 0 };
  if (/\.(?:pdf|docx?|xlsx?|jpg|png)\.(?:exe|scr|js|vbs|bat|cmd)(?:$|\s)/i.test(lower)) return { text: raw, intensity: 4, category: 'double_extension' };
  if (/(?:https?:\/\/|www\.|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/|$))/i.test(value)) {
    if (/(?:@|\.(?:exe|scr|js|vbs|bat|cmd)(?:$|[?#]))/i.test(lower)) return { text: raw, intensity: 4, category: 'suspicious_link' };
    if (/(?:login|signin|verify|password|token|otp|redirect)/i.test(lower)) return { text: raw, intensity: 3, category: 'suspicious_link' };
    return { text: raw, intensity: 1, category: 'link' };
  }
  if (/(?:password|passcode|pin|otp|ssn|social security|credit card|card number|cvv|bank account|nid)/i.test(lower)) return { text: raw, intensity: 4, category: 'sensitive' };
  if (/(?:suspended|locked|unauthorized|security alert|account alert|threat|warning)/i.test(lower)) return { text: raw, intensity: 3, category: 'threat' };
  if (/(?:urgent|immediately|act now|expires|asap|within \d+ hours?)/i.test(lower)) return { text: raw, intensity: 2, category: 'urgency' };
  if (/(?:winner|prize|lottery|inheritance|congratulations|claim|reward|bonus|gift)/i.test(lower)) return { text: raw, intensity: 2, category: 'prize' };
  if (/(?:click|download|open|verify|confirm|update|login|sign-in)/i.test(lower)) return { text: raw, intensity: 2, category: 'action' };
  if (/(?:paypal|amazon|microsoft|apple|google|netflix|bkash|nagad|daraz|bank)/i.test(lower)) return { text: raw, intensity: 1, category: 'brand' };
  if (/^[A-Z]{3,}$/.test(value.replace(/[^A-Z]/g, ''))) return { text: raw, intensity: 2, category: 'caps' };
  return { text: raw, intensity: 0 };
};

const explanations: Record<string, ThreatExplanation> = {
  double_extension: { title: 'Double extension', description: 'The attachment name disguises an executable as a document or image.', tips: ['Do not open it', 'Verify the sender independently', 'Scan attachments before opening'] },
  suspicious_link: { title: 'Suspicious link', description: 'This link contains a structure or action commonly associated with credential theft or malicious downloads.', tips: ['Do not click it', 'Open the official site manually', 'Inspect the hostname before entering information'] },
  sensitive: { title: 'Sensitive information', description: 'The message references credentials, identity data, or payment information.', tips: ['Never share passwords or PINs by email', 'Use official support channels', 'Treat unexpected requests as suspicious'] },
  threat: { title: 'Threatening language', description: 'Threats and account warnings can pressure recipients into acting without verifying the message.', tips: ['Pause before responding', 'Check the account directly through the official app', 'Contact the organization using a known number'] },
  urgency: { title: 'Urgency tactic', description: 'Urgent wording is often used to reduce the time available for careful verification.', tips: ['Do not let deadlines pressure you', 'Verify through a trusted channel', 'Look for independent confirmation'] },
  prize: { title: 'Prize or reward bait', description: 'Unexpected prizes and rewards are common social-engineering lures.', tips: ['Do not pay to claim an unexpected prize', 'Do not share identity or banking details', 'Consider whether you entered the contest'] },
  action: { title: 'Call to action', description: 'The message asks you to click, download, verify, or update something.', tips: ['Navigate to the official site yourself', 'Inspect attachments before opening', 'Verify the request with the sender'] },
  brand: { title: 'Brand mention', description: 'A brand name is present. A brand mention alone is not proof of phishing, so verify the surrounding context.', tips: ['Check the sender domain', 'Use official bookmarks', 'Do not rely on logos or names alone'] },
  caps: { title: 'All-caps wording', description: 'Excessive capitalization can be used to create pressure, although it is not proof by itself.', tips: ['Focus on the sender and requested action', 'Verify urgent claims independently', 'Treat it as a supporting signal only'] },
  link: { title: 'Low-risk link structure', description: 'A link was found without a strong local warning. Continue to verify the destination and context.', tips: ['Check the hostname', 'Confirm the sender', 'Use official sites for sensitive actions'] }
};

export const EmailHeatMap = ({ emailText, result }: EmailHeatMapProps) => {
  const tokens = useMemo(() => emailText.split(/(\s+)/).map(classifyEmailToken), [emailText]);
  return (
    <ThreatHeatMapCard
      title="Email Threat Heat Map"
      icon={<Mail className="h-5 w-5" />}
      tokens={tokens}
      result={result}
      itemLabel="suspicious elements"
      emptyMessage="Paste an email to inspect its language, links, and requests."
      getCategoryLabel={category => explanations[category]?.title || 'Email indicator'}
      getThreatExplanation={category => explanations[category] || explanations.link}
    />
  );
};

