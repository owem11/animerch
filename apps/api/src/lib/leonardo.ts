const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const MODEL_ID = "e71a1c2f-4f80-4800-934f-2c68979d8cc8"; // Leonardo Anime XL

export const generateImageFromDescription = async (title: string, description: string): Promise<string | null> => {
    try {
        if (!LEONARDO_API_KEY) {
            console.error("LEONARDO_API_KEY not found in environment variables");
            return null;
        }

        console.log(`Leonardo AI: Generating image for: ${title} using model ${MODEL_ID}`);

        const prompt = `High quality anime style merchandise product image: ${title}. ${description || ''} Professional product photography style, centered composition, clean white background, high resolution masterpiece.`;

        // 1. Create Generation Job
        const createResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "authorization": `Bearer ${LEONARDO_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                modelId: MODEL_ID,
                width: 768,
                height: 768,
                num_images: 1,
            })
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error(`Leonardo AI Create Error: ${createResponse.status}`, errorText);
            return null;
        }

        const createData = await createResponse.json();
        const generationId = createData.sdGenerationJob?.generationId;

        if (!generationId) {
            console.error("Leonardo AI: No generationId returned", createData);
            return null;
        }

        // 2. Poll for Results
        console.log(`Leonardo AI: Job created (${generationId}). Polling for results...`);
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

            const getResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                method: "GET",
                headers: {
                    "accept": "application/json",
                    "authorization": `Bearer ${LEONARDO_API_KEY}`
                }
            });

            if (!getResponse.ok) {
                console.error(`Leonardo AI Poll Error: ${getResponse.status}`);
                return null;
            }

            const getData = await getResponse.json();
            const generation = getData.generations_by_pk;

            if (generation?.status === "COMPLETE") {
                const imageUrl = generation.generated_images?.[0]?.url;
                if (imageUrl) {
                    console.log("Leonardo AI: Image generated successfully!");
                    return imageUrl;
                }
                console.error("Leonardo AI: No image URL in completed generation");
                return null;
            } else if (generation?.status === "FAILED") {
                console.error("Leonardo AI: Generation failed on their end");
                return null;
            }

            attempts++;
            console.log(`Leonardo AI: Processing... (attempt ${attempts}/${maxAttempts})`);
        }

        console.error("Leonardo AI: Polling timed out");
        return null;
    } catch (error) {
        console.error("Leonardo AI Exception:", error);
        return null;
    }
};
