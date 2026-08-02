export interface PhishingResult {
  score: number;
  reasons: string[];
  categorizedReasons: {
    urls: string[];
    brand: string[];
    grammar: string[];
    attachments: string[];
    advanced: string[];
    headers: string[];
    context: string[];
    other: string[];
  };
  details: {
    keywordMatches: number;
    urlIssues: number;
    sensitiveRequests: number;
    brandImpersonation: boolean;
    detectedLanguage?: string;
    riskLevel: 'safe' | 'suspicious' | 'phishing';
    totalIndicators: number;
  };
  confidence: number;
  timestamp: number;
  emailPreview?: string;
  inputType: InputType;
  inputContent: string;
  metadata?: {
    urlAnalysis?: {
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
    }[];
    ipAnalysis?: any[];
    domainAnalysis?: any[];
    fileAnalysis?: any[];
    individualResults?: {
      item: string;
      score: number;
      verdict: string;
      riskLevel: 'safe' | 'suspicious' | 'phishing';
      reasons: string[];
    }[];
  };
  analysisDetails?: {
    engines: {
      name: string;
      status: string;
      score: number;
    }[];
    threatLevel: string;
    riskFactors: number;
    communityFeedback: {
      similarReports: number;
      firstSeen: string;
      lastSeen: string;
    };
    detectionRatio: string;
    categories: string[];
  };
  apiResults?: {
    urlReputation?: Record<string, unknown>;
    ipGeolocation?: Record<string, unknown>;
    domainWhois?: Record<string, unknown>;
    virusTotal?: Record<string, unknown>;
  };
}

export interface AnalysisHistory {
  id: string;
  result: PhishingResult;
  timestamp: number;
  inputType: InputType;
  inputContent: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string; // Lucide icon component or string emoji
  unlocked: boolean;
  unlockedAt?: number;
}

export type InputType = 'email' | 'file' | 'url' | 'ip' | 'domain';

export interface UserStats {
  totalAnalyses: number;
  phishingDetected: number;
  safeEmails: number;
  accuracy: number;
  achievements: Achievement[];
}
