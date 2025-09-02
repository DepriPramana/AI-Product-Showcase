
import { GeneratedImage } from './types';

export const PHOTOSHOOT_THEMES = [
  { value: 'Studio Professional', label: 'Studio Professional' },
  { value: 'Urban Street Style', label: 'Urban Street Style' },
  { value: 'Outdoor Lifestyle', label: 'Outdoor Lifestyle' },
  { value: 'Minimalist & Artsy', label: 'Minimalist & Artsy' },
  { value: 'Elegant & Luxury', label: 'Elegant & Luxury' },
  { value: 'Beachside', label: 'Beachside' },
  { value: 'Vintage Cafe', label: 'Vintage Cafe' },
];

export const LIGHTING_STYLES = [
  { value: 'Studio Lighting', label: 'Studio Lighting' },
  { value: 'Golden Hour', label: 'Golden Hour' },
  { value: 'Dramatic Shadows', label: 'Dramatic Shadows' },
  { value: 'Soft Natural Light', label: 'Soft Natural Light' },
  { value: 'Neon & Cyberpunk', label: 'Neon & Cyberpunk' },
];

export const INITIAL_IMAGES: GeneratedImage[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `placeholder-${i}`,
  src: `https://picsum.photos/seed/${i+10}/400/600`,
  mimeType: 'image/jpeg',
  prompt: null,
}));
