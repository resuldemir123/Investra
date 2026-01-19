
export interface AnalysisResult {
  executiveSummary: string;
  valuationRange: string;
  burnRateFactor: string;
  tam2025: string;
  scores: {
    market: number;
    team: number;
    product: number;
    finance: number;
  };
  industryAverage: {
    market: number;
    team: number;
    product: number;
    finance: number;
  };
  growthProjections: {
    year: string;
    marketSize: string;
  }[];
  strategicAdvice: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  unitEconomics: {
    cac: string;
    ltv: string;
    payback: string;
    ratio: string;
  };
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  title: string;
  summary: string;
  result: AnalysisResult;
}

export interface MarketIntelligence {
  globalSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number;
  trends: {
    title: string;
    description: string;
    impact: 'High' | 'Medium';
  }[];
  hotSectors: {
    name: string;
    growth: string;
    reason: string;
  }[];
  vcActivity: string;
}
