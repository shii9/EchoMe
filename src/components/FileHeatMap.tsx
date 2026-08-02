import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { ThreatHeatMapCard, type HeatMapToken, type ThreatExplanation } from './ThreatHeatMapCard';
import type { PhishingResult } from '../types/phishing';

interface FileHeatMapProps {
  fileName: string;
  result?: PhishingResult;
}

const classifyFilePart = (raw: string): HeatMapToken => {
  const value = raw.trim();
  const lower = value.toLowerCase();
  if (!value) return { text: raw, intensity: 0 };
  if (/\.(?:pdf|docx?|xlsx?|jpg|png)\.(?:exe|scr|js|vbs|bat|cmd)(?:$|\s)/i.test(lower)) return { text: raw, intensity: 4, category: 'double_extension' };
  if (/\.(?:exe|scr|js|vbs|bat|cmd|pif|jar)$/i.test(lower)) return { text: raw, intensity: 4, category: 'executable' };
  if (/\.(?:docm|xlsm|pptm)$/i.test(lower)) return { text: raw, intensity: 4, category: 'macro' };
  if (/\.(?:zip|7z|rar|iso|img|dmg)$/i.test(lower)) return { text: raw, intensity: 3, category: 'archive' };
  if (/(?:password|login|account|invoice|payment|bank|resume|cv)/i.test(lower)) return { text: raw, intensity: 2, category: 'sensitive_name' };
  if (lower.length > 24) return { text: raw, intensity: 2, category: 'long_name' };
  if (/\.[a-z0-9]{2,5}$/i.test(lower)) return { text: raw, intensity: 1, category: 'recognized_file' };
  return { text: raw, intensity: 0 };
};

const explanations: Record<string, ThreatExplanation> = {
  double_extension: { title: 'Double extension', description: 'The name disguises an executable as a document or image.', tips: ['Do not open the file', 'Show file extensions in your file manager', 'Verify the sender through another channel'] },
  executable: { title: 'Executable file', description: 'Executable files can install software or run code when opened.', tips: ['Avoid opening unexpected executable files', 'Scan the file with trusted security software', 'Download software only from official sources'] },
  macro: { title: 'Macro-enabled Office file', description: 'Macro-enabled documents can run code when macros are enabled.', tips: ['Keep macros disabled by default', 'Verify unexpected invoices or forms', 'Use protected view and scan the file'] },
  archive: { title: 'Archive or disk image', description: 'Archives and disk images can conceal executable files.', tips: ['Scan before extracting or mounting', 'Verify the sender and expected contents', 'Do not run files from unknown archives'] },
  sensitive_name: { title: 'Sensitive-looking filename', description: 'Names involving accounts, payments, or credentials are common social-engineering bait.', tips: ['Confirm the request independently', 'Do not enter credentials into attached forms', 'Check the sender address carefully'] },
  long_name: { title: 'Unusually long filename', description: 'Long names can hide extensions or confuse the real file type.', tips: ['Inspect the full filename', 'Look for double extensions', 'Use file properties to confirm the type'] },
  recognized_file: { title: 'Recognized file type', description: 'The filename has a normal-looking extension and no strong local warning was found.', tips: ['Confirm that you expected the file', 'Scan attachments before opening', 'Keep applications and antivirus updated'] }
};

export const FileHeatMap = ({ fileName, result }: FileHeatMapProps) => {
  const tokens = useMemo(() => fileName.split(/(\s+|[_-])/).map(classifyFilePart), [fileName]);
  return (
    <ThreatHeatMapCard
      title="File Threat Heat Map"
      icon={<FileText className="h-5 w-5" />}
      tokens={tokens}
      result={result}
      itemLabel="suspicious elements"
      emptyMessage="Choose a file to inspect its name and extension."
      getCategoryLabel={category => explanations[category]?.title || 'File indicator'}
      getThreatExplanation={category => explanations[category] || explanations.recognized_file}
    />
  );
};

