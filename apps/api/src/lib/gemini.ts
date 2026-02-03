
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// "Nano Banana Pro" implementation using Google Imagen 3 via REST
// Note: The user refers to Imagen 3 (or similar high-end Gemini image model) as Nano Banana Pro.
// We use the Gemini API Key to access it.
const generateImageWithNanoBananaPro = async (prompt: string): Promise<string | null> => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;

        // Try the Generative Language API endpoint for Imagen 3
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "1:1"
                }
            })
        });

        if (!response.ok) {
            console.warn("Nano Banana Pro (Imagen 3) API Error:", response.status, await response.text());
            return null;
        }

        const data = await response.json();
        // Check for Vertex AI style response or Generative Language style
        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
            return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
        }
        // Check for alternative format just in case
        if (data.predictions && data.predictions[0] && data.predictions[0].mimeType && data.predictions[0].bytesBase64Encoded) {
            return `data:${data.predictions[0].mimeType};base64,${data.predictions[0].bytesBase64Encoded}`;
        }

        return null;
    } catch (error) {
        console.error("Nano Banana Pro (Imagen 3) Exception:", error);
        return null;
    }
};

export const generateImageFromDescription = async (title: string, description: string) => {
    try {
        console.log(`Generating image for: ${title}`);

        // Simplified Prompt for Pollinations
        // using just title and "anime style" ensuring it finds something relevant.
        const basePrompt = `${title} anime style high quality detailed`;
        const encodedPrompt = encodeURIComponent(basePrompt);

        // Random seed to ensure different images
        const seed = Math.floor(Math.random() * 10000);

        // Using 'flux' as it generally yields better results for "anime" style
        // but 'turbo' is safer if 'flux' is timing out. Let's try turbo first as it is lightning fast.
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=800&model=turbo&seed=${seed}`;

        console.log("Generated Pollinations URL:", imageUrl);
        return imageUrl;
    } catch (error) {
        console.error("AI Generation Error:", error);
        // Fallback
        return `https://pollinations.ai/p/${encodeURIComponent(title)}?width=800&height=800&model=turbo`;
    }
};
