import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { ThreatHeatMapCard, type HeatMapToken, type ThreatExplanation } from './ThreatHeatMapCard';
import type { PhishingResult } from '../types/phishing';

interface IPHeatMapProps {
  ipText: string;
  result?: PhishingResult;
}

const parseIp = (value: string) => {
  const parts = value.split('.');
  if (parts.length !== 4 || parts.some(part => !/^\d+$/.test(part) || Number(part) > 255)) return null;
  return parts.map(Number);
};

const classifyIp = (raw: string): HeatMapToken => {
  const value = raw.trim();
  if (!value) return { text: raw, intensity: 0 };
  const parts = parseIp(value);
  if (!parts) return { text: raw, intensity: 4, category: 'invalid' };
  const [first, second] = parts;
  if (first === 127 || first === 0 || first >= 224 || (first === 169 && second === 254)) return { text: raw, intensity: 3, category: 'reserved' };
  if (first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168)) return { text: raw, intensity: 2, category: 'private' };
  return { text: raw, intensity: 1, category: 'valid_public' };
};

const explanations: Record<string, ThreatExplanation> = {
  invalid: { title: 'Invalid IP address', description: 'This value is not a valid IPv4 address.', tips: ['Use four numeric octets', 'Each octet must be between 0 and 255', 'Check for copied text or a malformed link'] },
  reserved: { title: 'Reserved or local IP range', description: 'This address belongs to a range reserved for local, testing, multicast, or special use.', tips: ['Do not treat it as a public service address', 'Verify why it appeared in the message', 'Avoid logging in through raw IP links'] },
  private: { title: 'Private IP address', description: 'This address is intended for internal networks and is unusual in a public phishing link.', tips: ['Private IPs should not host public login pages', 'Verify the source through an official channel', 'Do not open unexpected internal addresses'] },
  valid_public: { title: 'Valid public IP', description: 'The address is structurally valid and does not belong to a private or reserved range.', tips: ['A valid IP is not automatically trustworthy', 'Check reputation before connecting', 'Prefer a recognizable domain for sensitive actions'] }
};

export const IPHeatMap = ({ ipText, result }: IPHeatMapProps) => {
  const tokens = useMemo(() => ipText.split(/(\s+)/).map(classifyIp), [ipText]);
  return (
    <ThreatHeatMapCard
      title="IP Address Threat Heat Map"
      icon={<MapPin className="h-5 w-5" />}
      tokens={tokens}
      result={result}
      itemLabel="suspicious elements"
      emptyMessage="Enter an IPv4 address to inspect its range."
      getCategoryLabel={category => explanations[category]?.title || 'IP indicator'}
      getThreatExplanation={category => explanations[category] || explanations.valid_public}
    />
  );
};

