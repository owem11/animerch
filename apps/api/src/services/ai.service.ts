import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Using the exact model identifier from the user's dashboard
        // Using gemini-2.5-flash from user dashboard
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    /**
     * Helper to call AI with basic exponential backoff for rate limits
     */
    private async callWithRetry(fn: () => Promise<any>, retries = 5, delay = 2000): Promise<any> {
        try {
            return await fn();
        } catch (error: any) {
            if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
                console.log(`Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.callWithRetry(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    /**
     * Comprehensive analysis: extraction, summary, and guardrails in ONE call
     */
    async analyzeEmail(body: string) {
        const prompt = `
      Perform a triple analysis on this customer email body:
      1. Extraction: What product or category (hoodie, mug, etc.) is the user asking for?
      2. Summary: A short (<200 char) summary for a DB logs.
      3. Guardrails: Is it sensitive (lawsuit, legal, angry, refund, scam)?

      EMAIL BODY:
      "${body}"

      Respond ONLY in valid JSON format:
      {
        "productSearch": { "productTitle": "string or null", "category": "string or null" },
        "summary": "string",
        "guardrail": { "triggered": boolean, "reason": "string or null" },
        "sentiment": "positive" | "neutral" | "negative"
      }
    `;

        try {
            const result = await this.callWithRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : text;

            return JSON.parse(jsonText);
        } catch (error) {
            console.error('Error analyzing email with AI:', error);
            // Safe fallback
            return {
                productSearch: { productTitle: null, category: null },
                summary: body.substring(0, 100) + '...',
                guardrail: { triggered: false, reason: null },
                sentiment: "neutral"
            };
        }
    }

    /**
     * Generate a response to the email
     */
    async generateResponse(history: any[], latestEmail: string, context: string, productData?: any) {
        let productContext = '';
        if (productData) {
            if (productData.exactMatch) {
                const p = productData.exactMatch;
                productContext = `
                I found the exact product they are looking for:
                - Title: ${p.title}
                - Price: ₹${p.selling_price}
                - Description: ${p.description}
                - URL: https://animerch.sam9scloud.in/product/${p.id}
                Mention the price and the URL.
                `;
            } else if (productData.alternatives && productData.alternatives.length > 0) {
                productContext = `
                I couldn't find an exact match, but suggest these alternatives:
                ${productData.alternatives.map((p: any) => `- ${p.title} (Price: ₹${p.selling_price}, URL: https://animerch.sam9scloud.in/product/${p.id})`).join('\n')}
                Present them as helpful options.
                `;
            } else {
                productContext = `No matching products found. Mention they can browse our latest collections.`;
            }
        }

        const prompt = `
      You are an AI support assistant for Animerch.
      
      ANIME STORE CONTEXT:
      ${context}

      PRODUCT DATABASE INFO:
      ${productContext}

      LATEST EMAIL:
      "${latestEmail}"

      INSTRUCTIONS:
      - Be professional, polite, and helpful.
      - DO NOT hallucinate product details. ONLY use provided PRODUCT DATABASE INFO.
      - If an exact product is found, include its price and URL.
      - Keep the response concise.

      Generate the response body:
    `;

        try {
            const result = await this.callWithRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating AI response:', error);
            throw error;
        }
    }

    /**
     * Quick summary for outgoing emails
     */
    async summarize(body: string) {
        const prompt = `Summarize this AI message in <200 chars: "${body}"`;
        try {
            const result = await this.callWithRetry(() => this.model.generateContent(prompt));
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            return body.substring(0, 200) + '...';
        }
    }
}
