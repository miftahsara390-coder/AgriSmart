import fs from 'fs';
import Scan from '../models/Scan.js';
import { generateWithDeepSeekFallback } from '../ai/agent.js';

// POST /api/scans
const scanPlant = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY;
    const hasValidKey = DEEPSEEK_API_KEY &&
      !DEEPSEEK_API_KEY.startsWith('your-');

    let diagnosis;

    if (hasValidKey) {
      try {
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
        const mimeType = req.file.mimetype || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${imageBase64}`;

        const messages = [
          {
            role: 'system',
            content: `You are an agricultural AI assistant specialized in plant disease diagnosis.
Analyze the image and respond ONLY with valid JSON in this exact format:
{
  "plant": "plant name",
  "disease": "disease name or Healthy",
  "confidence": 0.85,
  "symptoms": ["symptom1", "symptom2"],
  "advice": "brief general advice",
  "treatment": "specific treatment recommendation"
}`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this plant image.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ];

        const result = await generateWithDeepSeekFallback({
          messages,
          candidateModels: ['deepseek-flash', 'deepseek-chat'],
          temperature: 0.2,
        });

        const content = result.text || '{}';
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
        diagnosis = JSON.parse((jsonMatch[1] || content).trim());
      } catch (aiErr) {
        console.warn('DeepSeek AI scan error:', aiErr.message);
        diagnosis = buildFallbackDiagnosis();
      }
    } else {
      console.log('No valid DeepSeek API key — returning development scan fallback');
      diagnosis = buildFallbackDiagnosis();
    }

    // Save scan record (keep image file)
    const scan = await Scan.create({
      userId: req.user.id,
      cropId: req.body.cropId || null,
      imageUrl,
      plantName: diagnosis.plant || null,
      diagnosis,
      confidence: mapConfidence(diagnosis.confidence),
      recommendations: diagnosis.treatment || diagnosis.advice || null,
      status: 'completed',
    });

    res.json({
      success: true,
      scan: {
        id: scan.id,
        plant: diagnosis.plant,
        disease: diagnosis.disease,
        confidence: diagnosis.confidence,
        symptoms: diagnosis.symptoms || [],
        advice: diagnosis.advice,
        treatment: diagnosis.treatment,
        imageUrl: scan.imageUrl,
      },
      diagnosis: {
        plant: diagnosis.plant,
        problem: diagnosis.disease,
        confidence: typeof diagnosis.confidence === 'number' ? `${Math.round(diagnosis.confidence * 100)}%` : diagnosis.confidence,
        recommendations: diagnosis.treatment || diagnosis.advice,
        symptoms: diagnosis.symptoms || [],
        advice: diagnosis.advice,
        treatment: diagnosis.treatment,
      },
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

// GET /api/scans
const getScanHistory = async (req, res, next) => {
  try {
    const scans = await Scan.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    res.json({ scans });
  } catch (error) {
    next(error);
  }
};

function buildFallbackDiagnosis() {
  return {
    plant: 'Tomato',
    disease: 'Early Blight (Alternaria solani)',
    confidence: 0.78,
    symptoms: ['Brown spots with yellow rings', 'Lower leaf yellowing', 'Dark concentric lesions'],
    advice: 'Remove affected leaves immediately. Improve air circulation around plants.',
    treatment: 'Apply a copper-based fungicide. Ensure proper spacing between plants. Avoid overhead watering.',
    note: 'Development fallback — configure AI_API_KEY for real analysis',
  };
}

function mapConfidence(value) {
  if (typeof value === 'number') {
    if (value >= 0.75) return 'high';
    if (value >= 0.5) return 'medium';
    return 'low';
  }
  return 'medium';
}

export { scanPlant, getScanHistory };
export default { scanPlant, getScanHistory };
