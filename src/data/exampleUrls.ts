export interface ExampleUrl {
  id: string;
  title: string;
  category: 'safe' | 'suspicious' | 'phishing';
  technique?: string;
  content: string;
  description: string;
}

export const exampleUrls: ExampleUrl[] = [
  {
    id: 'safe-url-1',
    title: 'Safe - Well-known Domain',
    category: 'safe',
    content: 'https://www.google.com/',
    description: 'Well-known domain, HTTPS, short and expected. Why safe: recognized brand + valid TLS + no weird path.'
  },
  {
    id: 'safe-url-2',
    title: 'Safe - Trusted Host',
    category: 'safe',
    content: 'https://github.com/sourov/project',
    description: 'Trusted host + readable path. Why safe: official platform, predictable structure.'
  },
  {
    id: 'safe-url-3',
    title: 'Safe - Reputable Domain',
    category: 'safe',
    content: 'https://docs.example.com/report.pdf',
    description: 'Subdomain + file on a reputable domain. Why safe: domain matches owner, path is logical.'
  },
  {
    id: 'suspicious-url-1',
    title: 'Suspicious - Typosquat',
    category: 'suspicious',
    content: 'https://secure-bkash.com/login',
    description: 'Looks like bkash but domain is secure-bkash.com (typosquat). Signal: brands rarely use hyphenated domains.'
  },
  {
    id: 'suspicious-url-2',
    title: 'Suspicious - Subdomain Abuse',
    category: 'suspicious',
    technique: 'Subdomain abuse',
    content: 'https://bkash.com.scam-domain.xyz/login',
    description: 'bkash.com is just a subdomain of scam-domain.xyz. Signal: real bkash would own the root domain.'
  },
  {
    id: 'suspicious-url-3',
    title: 'Suspicious - Direct IP',
    category: 'suspicious',
    technique: 'IP-based URLs',
    content: 'http://192.0.2.45/admin',
    description: 'Direct IPs for login/admin pages are unusual for big services. Signal: could be a private panel or attacker host.'
  },
  {
    id: 'suspicious-url-4',
    title: 'Suspicious - Shortened Link',
    category: 'suspicious',
    technique: 'URL shorteners',
    content: 'https://bit.ly/2XyZabc',
    description: 'Shorteners hide the destination. Signal: used legitimately but also abused in phishing.'
  },
  {
    id: 'suspicious-url-5',
    title: 'Suspicious - Homoglyph',
    category: 'suspicious',
    technique: 'Homoglyph attacks',
    content: 'https://www.g00gle.com/',
    description: 'Zeroes instead of o\'s. Signal: lookalike characters or homoglyphs aim to trick your eye.'
  },
  {
    id: 'phishing-url-1',
    title: 'Phishing - Visual Impersonation',
    category: 'phishing',
    content: 'https://accounts.google.com.verify-abcdef.online/signin',
    description: 'Contains accounts.google.com visually but the real domain ends with .online. Signal: the actual domain is verify-abcdef.online.'
  },
  {
    id: 'phishing-url-2',
    title: 'Phishing - Username Trick',
    category: 'phishing',
    content: 'http://example.com@malicious.com/login',
    description: 'Everything before @ is treated as the username. Signal: the real host is malicious.com. Old trick but effective.'
  },
  {
    id: 'phishing-url-3',
    title: 'Phishing - Unexpected TLD',
    category: 'phishing',
    content: 'https://secure-bank.xyz/login.php?token=ABCD1234',
    description: 'Unexpected TLD and path login.php with token. Signal: designed to capture credentials.'
  },
  {
    id: 'phishing-url-4',
    title: 'Phishing - Double Extension',
    category: 'phishing',
    technique: 'Double extensions',
    content: 'https://files.example.com/download/report.pdf.exe',
    description: 'Double extension (.pdf.exe). Signal: executable disguised as a document.'
  },
  {
    id: 'phishing-url-5',
    title: 'Phishing - Triple Extension',
    category: 'phishing',
    technique: 'Double extensions',
    content: 'https://secure.download.com/file.txt.pdf.exe',
    description: 'Triple extension (.txt.pdf.exe). Signal: multiple layers of disguise to hide malicious executable.'
  },
  {
    id: 'phishing-url-6',
    title: 'Phishing - Hidden Extension',
    category: 'phishing',
    technique: 'Double extensions',
    content: 'https://docs.share.com/invoice.doc .exe',
    description: 'Space before extension (.doc .exe). Signal: space tricks Windows into showing only .doc extension.'
  },
  {
    id: 'phishing-url-7',
    title: 'Phishing - Archive Extension',
    category: 'phishing',
    technique: 'Double extensions',
    content: 'https://files.host.com/photo.jpg.zip',
    description: 'Image extension with archive (.jpg.zip). Signal: could contain malicious files inside the archive.'
  }
];
