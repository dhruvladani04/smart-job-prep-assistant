require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRewriteRoutes = require('./routes/resumeRewriteRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};
connectDB();

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const gemini = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume-rewrites', resumeRewriteRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'up' }));

// Resume file upload & parse endpoint (protected route)
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const parsed = await pdfParse(req.file.buffer);
    const prompt = `Extract the key resume bullet points from the following resume text. Return each bullet on its own line without markers.\n\n${parsed.text}`;
    const aiRes = await gemini.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const bullets = aiRes.response.text().split('\n').map(l => l.trim()).filter(Boolean);
    return res.json({ bullets });
  } catch (err) {
    console.error('Resume parse error:', err);
    return res.status(500).json({ error: 'Resume parse or Gemini extraction failed' });
  }
});

// Rewrite resume bullet endpoint
app.post('/api/rewrite-resume', async (req, res) => {
  const { jobDescription, resumeBullet } = req.body;
  if (!jobDescription || !resumeBullet) return res.status(400).json({ error: 'Missing jobDescription or resumeBullet' });

  const prompt = `You are a professional resume writer. Your task is to improve the following resume bullet point to better match the job description.

${jobDescription}

ORIGINAL BULLET POINT:
${resumeBullet}

INSTRUCTIONS:
1. Provide 3 improved versions of this bullet point
2. For each version, list 2-3 key changes made and why they improve the bullet
3. Format your response EXACTLY as shown below, including all section headers and separators:

---IMPROVED BULLETS---
1. [Improved bullet point 1 with strong action verb and metrics]
2. [Improved bullet point 2 with different focus area]
3. [Improved bullet point 3 with quantifiable results]

---KEY CHANGES---
1. [Change 1 for bullet 1][Change 2 for bullet 1][Change 3 for bullet 1]
2. [Change 1 for bullet 2][Change 2 for bullet 2][Change 3 for bullet 2]
3. [Change 1 for bullet 3][Change 2 for bullet 3][Change 3 for bullet 3]

RULES:
- Each bullet point should start with a strong action verb
- Include metrics and quantifiable results where possible
- Focus on the skills and requirements mentioned in the job description
- Keep each change description concise (1 short sentence)
- Use square brackets [] to separate multiple changes for each bullet
- Do not include any other text outside the specified format`;

  try {
    console.log('Sending request to Gemini...');
    const result = await gemini.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2000,
      },
    });

    // Get the raw response text
    const responseText = result.response.text().trim();
    console.log('Raw Gemini response:', responseText);

    // Parse the text response
    try {
      // Extract the improved bullets section
      const bulletsMatch = responseText.match(/---IMPROVED BULLETS---\s*([\s\S]*?)\s*---KEY CHANGES---/);
      if (!bulletsMatch) throw new Error('Could not find improved bullets section');
      
      const bulletsText = bulletsMatch[1].trim();
      const improvedBullets = bulletsText
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*\[?([^\]]+)\]?$/, '$1').trim())
        .filter(line => line.length > 0);

      // Extract the key changes section
      const changesMatch = responseText.match(/---KEY CHANGES---\s*([\s\S]*)/);
      if (!changesMatch) throw new Error('Could not find key changes section');
      
      const changesText = changesMatch[1].trim();
      const keyChanges = changesText
        .split('\n')
        .map(line => {
          const changes = line.replace(/^\d+\.\s*\[?(.*?)\]?$/, '$1')
            .split(/\]\s*\[/)
            .map(change => change.replace(/^\[?\s*|\s*\]?$/g, '').trim())
            .filter(change => change.length > 0);
          return changes.length > 0 ? changes : null;
        })
        .filter(changes => changes !== null);

      // Validate we have matching numbers of bullets and changes
      const numBullets = Math.min(improvedBullets.length, keyChanges.length);
      if (numBullets === 0) throw new Error('No valid bullet points or changes found');

      const trimmedBullets = improvedBullets.slice(0, numBullets);
      const trimmedKeyChanges = keyChanges.slice(0, numBullets);

      // Format the response
      const response = {
        rewritten: trimmedBullets.join('\n\n'),
        keyChanges: trimmedKeyChanges
      };

      console.log('Parsed response:', JSON.stringify(response, null, 2));
      return res.json(response);

    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      console.error('Response text was:', responseText);
      throw new Error(`Failed to parse response: ${parseError.message}`);
    }

  } catch (err) {
    console.error('Error in rewrite-resume:', {
      error: err.message,
      stack: err.stack,
      request: { jobDescription: jobDescription?.substring(0, 100) + '...', resumeBullet }
    });
    return res.status(500).json({ 
      error: 'Gemini rewrite error',
      details: err.message,
      requestId: Date.now()
    });
  }
});

app.post('/api/generate-star', async (req, res) => {
  const { bullet } = req.body;
  if (!bullet) return res.status(400).json({ error: 'Missing resume bullet' });

  const prompt = `Create a STAR-formatted interview answer for the following experience bullet from a resume. Return a plain JSON string with keys: situation, task, action, result.\n\nResume Bullet: ${bullet}`;

  try {
    const aiRes = await gemini.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    // Attempt to extract clean JSON from the AI's response
    let raw = aiRes.response.text();
    let jsonStart = raw.indexOf('{');
    let jsonEnd = raw.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found in response');
    const jsonString = raw.slice(jsonStart, jsonEnd + 1);
    const star = JSON.parse(jsonString);

    res.json({ star });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'STAR generation failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));