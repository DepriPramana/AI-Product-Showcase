
import type { Part } from '@google/genai';

export function fileToGenerativePart(file: File): Promise<Part> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      if (base64Data) {
        resolve({
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        });
      } else {
        reject(new Error("Failed to read file as base64."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function base64ToDataUrl(base64: string, mimeType: string): string {
    return `data:${mimeType};base64,${base64}`;
}
