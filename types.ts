export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

export interface FileData {
  name: string;
  type: string;
  content: string; // Base64 encoded content
  size: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface UserSession {
  name: string;
  email?: string;
  organization?: string;
  apiKey?: string;
  provider: string;
  baseUrl?: string;
  customModel?: string;
}