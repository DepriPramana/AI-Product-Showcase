import { GoogleGenAI, Modality, Part } from "@google/genai";
import { GenerationMode } from "../types";
import { base64ToDataUrl } from "../utils/imageUtils";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageModel = 'gemini-2.5-flash-image-preview';
const textModel = 'gemini-2.5-flash';
const videoModel = 'veo-2.0-generate-001';

interface GenerateImagesParams {
    mode: GenerationMode;
    theme: string;
    lighting: string;
    productImage: Part;
    modelImage?: Part;
}

interface GeneratedImageData {
    src: string;
    mimeType: string;
}

export async function generateImages({ mode, theme, lighting, productImage, modelImage }: GenerateImagesParams): Promise<GeneratedImageData[]> {
    const parts: Part[] = [];
    let promptText = '';

    if (mode === GenerationMode.Lookbook && modelImage) {
        promptText = `Generate 6 diverse, professional fashion lookbook photos.
        - **Subject**: The person from the first image.
        - **Attire**: The clothing item from the second image.
        - **Setting**: A '${theme}' environment.
        - **Lighting**: '${lighting}' style.
        - **Composition**: Create varied shots like full-body, half-body, and close-ups. Ensure the product is clearly visible. The final images must be photorealistic and high-quality.`;
        parts.push(modelImage, productImage);
    } else {
        promptText = `Generate 6 diverse, professional B-roll product photos for the item in the image.
        - **Setting**: A '${theme}' environment.
        - **Lighting**: '${lighting}' style.
        - **Composition**: Create varied shots including the product in a lifestyle setting, a close-up detail shot, and a hero shot. The images should look like premium advertisements, be photorealistic, and high-quality.`;
        parts.push(productImage);
    }

    parts.unshift({ text: promptText });

    const requests = Array(6).fill(0).map(() => 
        ai.models.generateContent({
            model: imageModel,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    );

    const responses = await Promise.all(requests);
    
    const generatedImages: GeneratedImageData[] = [];

    for (const response of responses) {
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const { data, mimeType } = part.inlineData;
                    generatedImages.push({
                        src: base64ToDataUrl(data, mimeType),
                        mimeType: mimeType
                    });
                    break; // Take the first image part from each response
                }
            }
        }
    }

    if (generatedImages.length === 0) {
        throw new Error("The AI failed to generate any images. Please try different inputs or settings.");
    }
    
    return generatedImages;
}

interface GeneratePromptParams {
    src: string;
    mimeType: string;
}

export async function generateImagePrompt({ src, mimeType }: GeneratePromptParams): Promise<string> {
    const base64Data = src.split(',')[1];
    const imagePart: Part = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const prompt = "Describe this image for a text-to-image AI generator. Focus on the subject, clothing, pose, background, lighting, and overall photorealistic style. Be concise.";
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: { parts: [imagePart, { text: prompt }] },
    });

    return response.text;
}

export async function generateVideoFromImage({ src, mimeType }: GeneratePromptParams): Promise<string> {
    const base64Data = src.split(',')[1];
    
    let operation = await ai.models.generateVideos({
        model: videoModel,
        prompt: 'Animate this image, creating a short, high-quality video clip with subtle motion.',
        image: {
            imageBytes: base64Data,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1
        }
    });

    // Polling loop
    while (!operation.done) {
        // Wait for 10 seconds before checking the status again.
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download the generated video. Status: ${response.status}`);
    }
    const videoBlob = await response.blob();
    const videoObjectUrl = URL.createObjectURL(videoBlob);
    
    return videoObjectUrl;
}
