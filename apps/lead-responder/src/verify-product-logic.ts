import dotenv from 'dotenv';
import { DatabaseService } from './services/db.service';
import { AIService } from './services/ai.service';

dotenv.config();

async function verifyProductLogic() {
    console.log('--- VERIFYING PRODUCT SEARCH LOGIC ---');

    const dbService = new DatabaseService(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const aiService = new AIService(process.env.GEMINI_API_KEY!);

    // TEST CASE 1: Exact Match (using data we know exists)
    const testEmail1 = "Hi, do you have the 'Megumi Shadow Technique Tee' in stock? How much is it?";
    console.log('\nTest Case 1: Exact Match Search');
    await runTestRecord(testEmail1, aiService, dbService);
}

async function runTestRecord(emailBody: string, aiService: AIService, dbService: DatabaseService) {
    console.log('Email:', emailBody);

    // 1. Consolidated Analysis
    const analysis = await aiService.analyzeEmail(emailBody);
    console.log('Analysis result:', analysis);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Delay to avoid rate limits

    const keywords = analysis.productSearch;

    // 2. Search DB
    const productData = await dbService.findProduct(keywords);
    if (productData.exactMatch) {
        console.log('RESULT: Exact Match Found ->', productData.exactMatch.title);
    } else if (productData.alternatives) {
        console.log(`RESULT: Found ${productData.alternatives.length} Alternatives`);
    }

    // 3. Generate Response
    const response = await aiService.generateResponse([], emailBody, "Animerch is an anime store.", productData);
    console.log('AI Response Snippet:', response.substring(0, 200).replace(/\n/g, ' '));
}

verifyProductLogic();
