import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GeneratedImage } from "../types";

// Initialize Gemini Client
// Note: API Key is expected to be in process.env.API_KEY
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a coloring book cover and pages.
 * We split this into multiple calls to ensure high quality and variety.
 */
export const generateColoringBookImages = async (
  theme: string, 
  childName: string,
  onProgress: (status: string) => void
): Promise<GeneratedImage[]> => {
  const ai = getAiClient();
  const images: GeneratedImage[] = [];

  try {
    // 1. Generate Cover (Color)
    onProgress("Designing a magical cover...");
    const coverPrompt = `A vibrant, colorful, cute cartoon style children's book cover illustration about ${theme}. High quality, happy atmosphere, vivid colors. No text, empty space in center for title.`;
    
    const coverResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: coverPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '3:4',
      },
    });

    if (coverResponse.generatedImages?.[0]?.image?.imageBytes) {
      images.push({
        id: `cover-${Date.now()}`,
        url: `data:image/jpeg;base64,${coverResponse.generatedImages[0].image.imageBytes}`,
        type: 'cover',
        prompt: coverPrompt
      });
    }

    // 2. Generate Pages (B&W) - Batch 1 (3 images)
    onProgress("Drawing the first few pages...");
    
    // We vary the prompts slightly to ensure distinct pages
    const pagePrompts = [
      `coloring book page, black and white outline art, ${theme}, main character action shot, thick lines, white background, simple style for kids, no shading`,
      `coloring book page, black and white outline art, ${theme}, funny scene, thick lines, white background, simple style for kids, no shading`,
      `coloring book page, black and white outline art, ${theme}, close up detail, thick lines, white background, simple style for kids, no shading`,
      `coloring book page, black and white outline art, ${theme}, full pattern background, thick lines, white background, simple style for kids, no shading`,
      `coloring book page, black and white outline art, ${theme}, peaceful scene, thick lines, white background, simple style for kids, no shading`
    ];

    // Helper to fetch a single image (Imagen 4 doesn't always support >1 reliably in all regions for all prompts, 
    // but we can try generating 4 at once if quota allows. To be safe and precise with prompts, we loop or batch).
    // Note: `imagen-4.0-generate-001` supports `numberOfImages`.
    // Let's try to generate 4 images in one go for the first batch, then 1 for the last.
    
    // Batch 1: 4 images
    const batch1Response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A set of diverse coloring book pages about ${theme}. Black and white outline art, thick lines, white background, no shading.`,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        aspectRatio: '3:4',
      },
    });

    if (batch1Response.generatedImages) {
        batch1Response.generatedImages.forEach((img, idx) => {
            if (img.image.imageBytes) {
                images.push({
                    id: `page-b1-${idx}`,
                    url: `data:image/jpeg;base64,${img.image.imageBytes}`,
                    type: 'page',
                    prompt: 'Batch 1 generated page'
                });
            }
        });
    }

    // If we didn't get enough (e.g. model returned fewer than 4), or we just want 1 more to make 5 distinct pages.
    // Let's generate 1 more specific one to ensure we hit the target of 5 pages + 1 cover.
    onProgress("Adding final touches...");
    
    const finalPageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A single detailed coloring book page about ${theme}, finale scene. Black and white outline art, thick lines, white background.`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '3:4',
        },
    });

    if (finalPageResponse.generatedImages?.[0]?.image?.imageBytes) {
        images.push({
            id: `page-final`,
            url: `data:image/jpeg;base64,${finalPageResponse.generatedImages[0].image.imageBytes}`,
            type: 'page',
            prompt: 'Final page'
        });
    }

    return images;

  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
};

/**
 * Chat helper to brainstorm ideas using Gemini 3 Pro
 */
export const createChatSession = () => {
    const ai = getAiClient();
    return ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: "You are a helpful, creative assistant for a children's coloring book app. Help parents brainstorm fun, specific themes for their kids (e.g., 'Steampunk Cats' instead of just 'Cats'). Keep answers short and encouraging.",
        }
    });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
    try {
        const response = await chat.sendMessage({ message });
        return response.text || "I'm having trouble thinking right now. Try again!";
    } catch (e) {
        console.error(e);
        return "Sorry, I couldn't connect to my brain!";
    }
};