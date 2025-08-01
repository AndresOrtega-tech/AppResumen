export interface Analysis {
  id: string;
  user_id: string;
  original_text: string;
  summary: string;
  keywords: string[];
  sentiment: SentimentResult;
  created_at: string;
  updated_at: string;
}

export interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface AnalysisRequest {
  text: string;
}

export interface AnalysisResponse {
  id: string;
  summary: string;
  keywords: string[];
  sentiment: SentimentResult;
  created_at: string;
}

export interface AnalysisHistory {
  analyses: Analysis[];
  total: number;
  page: number;
  limit: number;
}