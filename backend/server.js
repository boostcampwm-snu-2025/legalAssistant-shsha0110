import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware Setup ---
// Enable CORS to allow requests from the Frontend (Port 5173)
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());

// --- Routes ---

/**
 * Health Check Endpoint
 * Verifies if the server is running correctly.
 */
app.get('/', (req, res) => {
  console.log('[Server] Health check requested');
  res.status(200).send('Labor Contract AI Server is healthy and running.');
});

/**
 * AI Legal Review Endpoint (Placeholder)
 * This will handle the communication with Gemini/ChatGPT API later.
 */
app.post('/api/review', (req, res) => {
  try {
    const { contractData } = req.body;
    console.log('[Server] Received contract data for review:', contractData);

    // TODO: Implement OpenAI or Gemini API integration here
    
    // Mock response for testing frontend connection
    const mockResponse = {
      message: "AI review completed successfully (Mock).",
      riskScore: 85,
      riskLevel: "SAFE",
      issues: []
    };

    res.status(200).json(mockResponse);
  } catch (error) {
    console.error('[Server] Error processing review:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});