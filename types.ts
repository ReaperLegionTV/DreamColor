export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  type: 'cover' | 'page';
  prompt: string;
}

export interface ColoringBookState {
  theme: string;
  childName: string;
  isGenerating: boolean;
  currentStep: number; // 0: Input, 1: Generating, 2: Complete
  images: GeneratedImage[];
  error: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_COVER = 'GENERATING_COVER',
  GENERATING_PAGES = 'GENERATING_PAGES',
  FINALIZING = 'FINALIZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}