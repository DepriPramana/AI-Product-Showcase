
import type { Part } from '@google/genai';

export enum GenerationMode {
  Lookbook = 'Lookbook',
  Broll = 'B-roll',
}

export interface GeneratedImage {
  id: string;
  src: string;
  mimeType: string;
  prompt: string | null;
}

export interface ImageData {
  part: Part;
  url: string;
}
