
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// "Nano Banana Pro" implementation using Google Imagen 3 via REST
// Note: The user refers to Imagen 3 (or similar high-end Gemini image model) as Nano Banana Pro.
// We use the Gemini API Key to access it.
const generateImageWithNanoBananaPro = async (prompt: string): Promise<string | null> => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;

        // Use Nano Banana Pro (Gemini 3 Pro Image Preview) via generateContent
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            console.warn("Nano Banana Pro (Gemini 3) API Error:", response.status, await response.text());
            return null;
        }

        const data = await response.json();

        // Extract inlineData from candidate
        const part = data.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }

        return null;
    } catch (error) {
        console.error("Nano Banana Pro (Gemini 3) Exception:", error);
        return null;
    }
};


export const generateImageFromDescription = async (title: string, description: string) => {
    try {
        console.log(`Generating image for: ${title}`);

        // Build a detailed prompt for better image generation
        const prompt = `High quality anime style merchandise product image: ${title}. ${description || ''} Professional product photography, centered composition, clean background.`;

        // Try Gemini Imagen 3 API
        const imageUrl = await generateImageWithNanoBananaPro(prompt);

        if (imageUrl) {
            console.log("Generated image with Gemini Imagen 3");
            return imageUrl;
        }

        // If Imagen 3 fails, return error
        console.error("Gemini Imagen 3 API failed - check your GEMINI_API_KEY");
        throw new Error("Image generation failed - API key may be invalid or Imagen 3 access not enabled");
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};

