import { GoogleGenerativeAI } from "@google/generative-ai";

// Keep for potential text/description generation tasks
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

