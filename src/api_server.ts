import express from 'express';
import { deepResearch, writeFinalReport } from './deep-research';
import { generateFeedback } from './feedback';

const app = express();
app.use(express.json());

// Generate follow-up questions endpoint
app.post('/api/generate-feedback', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const followUpQuestions = await generateFeedback({ query });
    res.json({ followUpQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deep research execution endpoint
app.post('/api/deep-research', async (req, res) => {
  try {
    const { query, breadth = 4, depth = 2 } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const sanitizedBreadth = Math.min(Math.max(parseInt(breadth) || 4, 2), 10);
    const sanitizedDepth = Math.min(Math.max(parseInt(depth) || 2, 1), 5);

    const { learnings, visitedUrls } = await deepResearch({
      query,
      breadth: sanitizedBreadth,
      depth: sanitizedDepth,
    });

    res.json({ learnings, visitedUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report generation endpoint
app.post('/api/generate-report', async (req, res) => {
  try {
    const { prompt, learnings, visitedUrls } = req.body;
    if (!prompt || !learnings || !visitedUrls) {
      return res.status(400).json({ 
        error: 'Prompt, learnings, and visitedUrls are required' 
      });
    }

    const report = await writeFinalReport({ prompt, learnings, visitedUrls });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Research server running on port ${PORT}`);
});