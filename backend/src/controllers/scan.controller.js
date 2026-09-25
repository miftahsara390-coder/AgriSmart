const axios = require('axios');
const fs = require('fs');

// POST /api/scan
const scanPlant = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imagePath = req.file.path;
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    const mimeType = req.file.mimetype;

    const openai = require('openai');
    const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an agricultural AI assistant specialized in plant disease diagnosis.
Analyze the image and provide:
1. Plant identification (if visible)
2. Detected problems or diseases
3. Confidence level (low/medium/high)
4. Recommendations for treatment

IMPORTANT: Always mention that this diagnosis is informational only and does not replace professional agricultural advice.
Respond in a structured JSON format.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: 'text',
              text: 'Please analyze this plant image and provide a diagnosis.',
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    const content = response.choices[0].message.content;

    // Try to parse JSON response
    let diagnosis;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || [null, content];
      diagnosis = JSON.parse(jsonMatch[1]);
    } catch {
      diagnosis = { raw: content };
    }

    res.json({
      success: true,
      diagnosis,
      disclaimer:
        'This scan is for informational purposes only and does not replace professional agricultural or phytopathological diagnosis.',
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

module.exports = { scanPlant };


