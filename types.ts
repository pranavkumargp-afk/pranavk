export interface AnalysisResult {
  primaryEmotion: string;
  emotionIntensity: number;
  triggerWords: string[];
  isSarcastic: boolean;
  sarcasmReasoning: string;
  contextSummary: string;
}

export interface TrendDataPoint {
  name: string;
  intensity: number;
}

export interface TherapistInfo {
  title: string;
  uri: string;
}
