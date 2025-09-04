import type { Part } from '@google/genai';

export enum GenerationMode {
  Lookbook = 'Lookbook',
  Broll = 'B-roll',
  OutfitBuilder = 'Outfit Builder',
}

export interface GeneratedImage {
  id: string;
  src: string;
  mimeType: string;
  prompt: string | null;
  videoPrompt: string | null;
}

export interface ImageData {
  id: string;
  part: Part;
  url: string;
}