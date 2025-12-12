import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. Gemini Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" } // Force JSON response
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---

app.get('/', (req, res) => {
  res.status(200).send('Labor Contract AI Server (Gemini Powered) is running.');
});

/**
 * 1. AI Legal Review Endpoint (Real Gemini Integration)
 */
app.post('/api/review', async (req, res) => {
  try {
    const { contractData } = req.body;
    console.log('[Server] Sending contract to Gemini for review...');

    // 1. Construct the Prompt
    // We send the JSON data and instructions on how to analyze it.
    const prompt = `
      You are an expert Korean Certified Public Labor Attorney (노무사).
      Analyze the following labor contract data based on the 2025 Korean Labor Standards Act (근로기준법).

      Contract Data: ${JSON.stringify(contractData)}

      **Task Requirements:**
      1. Check for violations of the Labor Standards Act (e.g., Minimum wage < 10,030 KRW, illegal penalty clauses).
      2. Identify ambiguous terms that could disadvantage the worker.
      3. Evaluate the 'otherTerms' field specifically for toxic clauses (e.g., fines for lateness).

      **Output Format (JSON Only):**
      {
        "riskScore": (integer 0-100, where 100 is perfectly safe),
        "riskLevel": ("SAFE", "CAUTION", or "DANGER"),
        "summary": (String, a brief overall assessment in Korean),
        "issues": [
          {
            "type": ("ILLEGAL" or "SUGGESTION"),
            "message": (String, warning message in Korean),
            "suggestion": (String, how to fix it in Korean),
            "legalReference": (String, relevant law article e.g., "근로기준법 제20조")
          }
        ],
        "plainLanguageSummary": {
          "wage": (String, summarize wage terms kindly in Korean),
          "workTime": (String, summarize work hours kindly in Korean),
          "rights": (String, summarize key rights kindly in Korean)
        }
      }
    `;

    // 2. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 3. Parse JSON and Send Response
    // Gemini 1.5 Flash in JSON mode usually returns a clean string, but safe parsing is good.
    const analysisResult = JSON.parse(text);
    
    console.log('[Server] Gemini Analysis Complete:', analysisResult.riskLevel);
    res.status(200).json(analysisResult);

  } catch (error) {
    console.error('[Server] Gemini Error:', error);
    // Fallback error response
    res.status(500).json({ 
      error: "AI processing failed", 
      details: error.message 
    });
  }
});

/**
 * 2. AI Chat Endpoint (Real Gemini Integration)
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    console.log('[Server] Chat Question:', message);

    // Context-aware Chat Prompt
    const prompt = `
      You are a helpful AI Labor Law Assistant.
      
      Context (Current Contract): ${JSON.stringify(context)}
      User Question: "${message}"

      Answer the question kindly in Korean, focusing on Korean Labor Law.
      If the user asks about the contract, refer to the provided Context.
      Keep the answer concise (under 3 sentences if possible).
      
      Response Format:
      { "reply": "Your answer here" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const chatResult = JSON.parse(text);

    res.status(200).json(chatResult);

  } catch (error) {
    console.error('[Server] Chat Error:', error);
    res.status(500).json({ error: "Chat processing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Gemini Powered Server running on http://localhost:${PORT}`);
});