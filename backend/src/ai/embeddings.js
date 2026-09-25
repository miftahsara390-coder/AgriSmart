const OpenAI = require('openai');
const { sequelize } = require('../config/database');
const Embedding = require('../models/Embedding');
const Document = require('../models/Document');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-dev' });

/**
 * Generate embedding vector for a text
 * @param {string} text
 * @returns {Promise<number[]>}
 */
const generateEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Token limit
  });
  return response.data[0].embedding;
};

/**
 * Compute cosine similarity between two vectors
 */
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Store embeddings for a document
 * @param {string} documentId
 * @param {string} text
 */
const indexDocument = async (documentId, text) => {
  const chunkSize = 500;
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  for (let i = 0; i < chunks.length; i++) {
    const vector = await generateEmbedding(chunks[i]);
    await Embedding.create({
      documentId,
      chunkIndex: i,
      chunkText: chunks[i],
      embedding: vector,
    });
  }
};

module.exports = { generateEmbedding, cosineSimilarity, indexDocument };


