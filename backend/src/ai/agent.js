const axios = require('axios');

const SYSTEM_PROMPT = `You are AgriSmart AI, an expert agricultural assistant designed to help farmers, agronomists, and growers manage their crops, soil, irrigation, plant health, and farm operations.

CORE AGRICULTURAL KNOWLEDGE & CAPABILITIES:
- You must answer questions about ANY crop, plant, vegetable, grain, or fruit tree (including tomatoes, olives, lemons, wheat, corn, peppers, grapes, potatoes, citrus, stone fruits, legumes, leafy greens, herbs, etc.).
- Provide practical, expert, and actionable advice across all agricultural domains:
  • Watering & Irrigation: Optimal irrigation schedules, drip irrigation, root-zone moisture, avoiding over/under-watering, and water conservation.
  • Pruning & Training: Pruning techniques (e.g., sucker pruning, canopy management, air circulation, tree pruning), staking, and trellising.
  • Pest & Disease Control: Diagnosis of fungal, bacterial, viral issues, pest management (aphids, mites, whiteflies, caterpillars), organic and integrated pest management (IPM) solutions.
  • Fertilizers & Soil Nutrition: Growth-stage-specific fertilization, NPK balances, compost, soil pH, and deficiency corrections.
  • Planting, Spacing & Harvesting: Sowing, transplanting, spacing, maturity signs, and yield optimization.

CRITICAL INVENTORY & CROP SCOPE RULES (MANDATORY):
1. UNIVERSAL CROP ANSWERS: You MUST answer agricultural questions about ANY crop, whether or not the crop is in the user's farm inventory. Never refuse, dismiss, or deflect a question about any crop (such as tomatoes, wheat, peppers, apples, etc.).
2. NEVER RESTRICT BY INVENTORY: Do NOT refuse or avoid answering a question just because the crop is not in the user's inventory. Never state or imply that a crop falls outside their farm inventory or that you can only discuss their registered crops.
3. NEVER UNNECESSARILY REDIRECT: If the user asks about a specific crop (e.g., "What are the best pruning and watering tips for high tomato yields?"), provide full, rich, expert advice specifically for THAT crop. Do NOT redirect the user away to other crops (e.g., do NOT tell them to ask about olives or lemons instead).
4. INVENTORY USAGE POLICY: The user's registered crops (if provided in FARM PROFILE CONTEXT below) are provided strictly to personalize general queries when no specific crop is mentioned (e.g., "How should I irrigate my fields today?"), or to offer relevant contextual comparisons. They MUST NEVER be used as a restriction or barrier.
5. SHORT FOLLOW-UP QUESTIONS: Conclude your comprehensive advice with one concise, relevant follow-up question (e.g., asking about their variety, growth stage, soil type, or climate) to offer further assistance.

STRICT SCOPE BOUNDARIES:
- You are an agricultural and farming assistant. ONLY refuse questions that are completely unrelated to agriculture, farming, crops, botany, plant care, gardening, or soil (e.g., software coding, calculus, celebrity gossip, video games, politics).
- For non-agricultural topics, politely state that you specialize exclusively in agriculture and farming.

LANGUAGE & FORMATTING:
- LANGUAGE: Always reply in the exact same language the user uses in their question (e.g., if asked in English reply in English, if asked in French reply in French, etc.).
- FORMATTING: Use clean, structured Markdown with bold section headers and bullet points. Keep advice practical, encouraging, and easy to read.`;

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

// Candidate DeepSeek models in order of priority
const DEFAULT_CANDIDATE_MODELS = [
  process.env.AI_MODEL || 'deepseek-chat',
  'deepseek-chat',
  'deepseek-flash',
  'deepseek-reasoner',
];

/**
 * Call DeepSeek Chat Completions API with automatic model fallback for high availability.
 */
async function generateWithDeepSeekFallback({ messages, candidateModels, temperature = 0.35, max_tokens, response_format }) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY;
  if (!apiKey || apiKey.startsWith('your-')) {
    throw new Error('No valid DeepSeek API key configured');
  }

  const models = [...new Set((candidateModels || DEFAULT_CANDIDATE_MODELS).filter(Boolean))];
  let lastError = null;

  for (const model of models) {
    try {
      const payload = {
        model,
        messages,
        temperature,
      };

      if (max_tokens) {
        payload.max_tokens = max_tokens;
      }

      if (response_format) {
        payload.response_format = response_format;
      }

      const response = await axios.post(
        `${DEEPSEEK_BASE_URL.replace(/\/+$/, '')}/chat/completions`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 45000,
        }
      );

      const choice = response.data?.choices?.[0];
      const content = choice?.message?.content;
      if (content) {
        return { text: content, model };
      }
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const errMsg = err.response?.data?.error?.message || err.message;
      console.warn(`AgriSmart Agent: DeepSeek model ${model} encountered issue (${status || 'error'}: ${errMsg?.slice(0, 60)}). Trying fallback...`);
    }
  }

  throw lastError || new Error('All DeepSeek candidate models failed');
}

/**
 * Run the agricultural AI Agent
 * @param {object} params
 * @param {string} params.userMessage
 * @param {Array}  params.history - Previous messages [{role, content}]
 * @param {string} params.userId
 * @param {string} [params.image] - Optional base64 encoded image
 * @param {string} [params.mimeType] - Optional image MIME type
 */
const runAgent = async ({ userMessage, history = [], userId, image, mimeType }) => {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY;
  const hasValidKey = DEEPSEEK_API_KEY && !DEEPSEEK_API_KEY.startsWith('your-');

  if (!hasValidKey) {
    console.warn('AgriSmart Agent: No valid DeepSeek API key — returning fallback response');
    return {
      content: buildFallbackResponse(userMessage, false),
      toolsUsed: [],
      model: 'fallback',
    };
  }

  try {
    // Optional farm context if userId provided
    let farmContext = '';
    if (userId) {
      try {
        const Crop = require('../models/Crop');
        const userCrops = await Crop.findAll({ where: { userId }, limit: 6 });
        if (userCrops && userCrops.length > 0) {
          farmContext = `\n\nFARM PROFILE CONTEXT (FOR PERSONALIZATION ONLY):
The farmer has the following crops currently registered in their farm profile:
` + userCrops.map(c => `- ${c.name} (${c.stage || 'Active'} stage, Status: ${c.status || 'Healthy'})`).join('\n') + `
IMPORTANT RULE: These registered crops are solely for personalizing general farm questions. If the user asks about any other crop (e.g. tomatoes, vegetables, fruit trees), directly provide full advice for that requested crop without restricting them, without redirecting them to their registered crops, and without mentioning that it is not in their inventory.`;
        }
      } catch (err) {
        // Non-critical, continue without context
      }
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + farmContext },
    ];

    // Format previous conversation history, ignoring legacy mistaken refusal messages
    history
      .filter((m) => m.role !== 'system')
      .filter((m) => {
        const txt = (m.content || m.text || '').toLowerCase();
        return !(m.role === 'assistant' && (txt.includes('outside your current farm inventory') || txt.includes('not in your current farm inventory')));
      })
      .slice(-10)
      .forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content || msg.text || '',
        });
      });

    // Current user message (multimodal if image provided)
    if (image) {
      const dataUri = image.startsWith('data:')
        ? image
        : `data:${mimeType || 'image/jpeg'};base64,${image}`;
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: userMessage || 'Please examine this crop image and provide agricultural advice.' },
          { type: 'image_url', image_url: { url: dataUri } },
        ],
      });
    } else {
      messages.push({
        role: 'user',
        content: userMessage || 'Hello',
      });
    }

    const candidateModels = image
      ? ['deepseek-flash', process.env.AI_MODEL || 'deepseek-chat', 'deepseek-chat']
      : DEFAULT_CANDIDATE_MODELS;

    const result = await generateWithDeepSeekFallback({
      messages,
      candidateModels,
      temperature: 0.35,
    });

    return {
      content: result.text || 'I could not generate a response.',
      toolsUsed: [],
      model: result.model,
    };
  } catch (error) {
    console.error('Agent error:', error.message);
    return {
      content: buildFallbackResponse(userMessage, true),
      toolsUsed: [],
      model: 'fallback',
    };
  }
};

function buildFallbackResponse(userMessage = '', hasKey = false) {
  const lower = (userMessage || '').toLowerCase();

  const note = hasKey
    ? `\n\n*(Note: DeepSeek cloud service was temporarily unreachable; here is an instant knowledge-based guide.)*`
    : `\n\n*(Note: Configure DEEPSEEK_API_KEY in your .env file for real-time generative capabilities.)*`;

  if (lower.includes('tomato')) {
    return `🍅 **Tomato Crop Guidance: Pruning & Watering for High Yields**

### ✂️ Pruning Tips:
• **Remove Suckers (Indeterminate varieties)**: Pinch out small lateral shoots developing in leaf axils (the 'V' between the main stem and leaf branches) when they are 2–5 cm long.
• **Maintain 1–2 Main Leaders**: Focus energy into strong fruit-bearing stems rather than excess foliage.
• **Prune Bottom Foliage**: Remove lower leaves up to 25–30 cm above the soil once plants are established. This prevents splash-borne soil pathogens (like early blight) and improves airflow.
• **Late-Season Topping**: About 4 weeks before the season ends or first frost, top the main stems so all remaining energy ripens existing fruits.

### 💧 Watering Principles:
• **Consistent & Deep Irrigation**: Tomatoes need 2.5–3.5 cm of water per week. Inconsistent watering causes blossom-end rot and fruit splitting.
• **Base/Drip Irrigation**: Always water at the base of the plant using drip or soaker hoses. Avoid wetting leaves to prevent fungal diseases.
• **Morning Timing**: Water early in the morning so surface moisture evaporates quickly.
• **Mulching**: Apply 5–8 cm of organic straw or compost to regulate soil moisture and root temperatures.

*What tomato variety are you growing (determinate bush or indeterminate vine), and are they in an open field, greenhouse, or containers?*${note}`;
  }

  if (lower.includes('yellow') || lower.includes('disease') || lower.includes('spot')) {
    return `🌿 **Plant Disease Advisory**\n\nYellow leaves and discoloration can indicate several issues:\n\n• **Nitrogen deficiency** — older leaves yellow from the bottom up. Apply balanced fertilizer.\n• **Overwatering / Poor Drainage** — check soil moisture 5–10 cm deep.\n• **Fungal leaf spot** — look for concentric rings or dark margins; apply copper-based organic fungicide.\n• **Viral infection** — mottled yellowing or curling; isolate affected plants.\n\n💡 Tip: You can attach a photo right here for instant visual analysis!${note}\n\n*Which plant is showing these symptoms, and are the newer or older leaves affected first?*`;
  }

  if (lower.includes('water') || lower.includes('irrigat')) {
    return `💧 **Irrigation Guidance**\n\nOptimal watering principles:\n\n• **Deep Watering**: Water deeply but less frequently to stimulate deep root structures.\n• **Morning Timing**: Irrigate before 9:00 AM to minimize evaporation and fungal mildew.\n• **Soil Check**: Inspect root zone moisture before triggering irrigation.\n• **Drip Efficiency**: Drip systems deliver 40% water savings over sprinkler sprayers.${note}\n\n*Which specific crop or soil type would you like tailored watering intervals for?*`;
  }

  if (lower.includes('fertili') || lower.includes('nutrient')) {
    return `🌱 **Fertilization Recommendations**\n\nKey soil nutrition guidelines:\n\n• **Vegetative Stage**: Emphasize nitrogen (N) for lush foliage development.\n• **Flowering & Fruiting**: Shift to potassium (K) and phosphorus (P) for blossoms and fruit size.\n• **Organic Enrichment**: Topdress with compost to boost water retention and soil microbiome.${note}\n\n*Which crop are you fertilizing, and what is its current growth stage?*`;
  }

  return `🌿 **AgriSmart AI Assistant**\n\nI am your agricultural AI assistant powered by DeepSeek.\n\nI can help you with any crop—including vegetables, fruit trees, grains, and specialty plants:\n• **Crop Diagnostics**: Identify symptoms or analyze attached plant photos\n• **Irrigation & Soil**: Smart watering schedules and soil moisture management\n• **Fertilization**: Nutrient recommendations by growth stage\n• **Pest & Disease Control**: Integrated pest management and treatments\n• **Harvest & Pruning**: Pruning methods, maturity checks, and yield optimization\n\n*Which crop or agricultural topic would you like advice on today?*${note}`;
}

module.exports = {
  runAgent,
  generateWithDeepSeekFallback,
  generateWithGeminiFallback: generateWithDeepSeekFallback, // backwards compatibility
};
