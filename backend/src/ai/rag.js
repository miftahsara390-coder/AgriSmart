const Embedding = require('../models/Embedding');
const Document = require('../models/Document');
const { generateEmbedding, cosineSimilarity } = require('./embeddings');

const TOP_K = 3; // Number of most relevant chunks to retrieve

/**
 * Retrieve the most relevant agricultural document chunks for a given query
 * @param {string} query - User question
 * @returns {Promise<string>} - Concatenated relevant context
 */
const retrieveRelevantContext = async (query) => {
  try {
    // Generate query embedding
    const queryVector = await generateEmbedding(query);

    // Fetch all embeddings (optimized for small to medium datasets)
    const embeddings = await Embedding.findAll({
      include: [{ model: Document, attributes: ['title', 'category'] }],
    });

    if (embeddings.length === 0) {
      return '';
    }

    // Compute similarities
    const scored = embeddings.map((emb) => ({
      chunkText: emb.chunkText,
      documentTitle: emb.Document?.title || 'Unknown',
      similarity: cosineSimilarity(queryVector, emb.embedding),
    }));

    // Sort by similarity and take top K
    scored.sort((a, b) => b.similarity - a.similarity);
    const topChunks = scored.slice(0, TOP_K).filter((s) => s.similarity > 0.3);

    if (topChunks.length === 0) {
      return '';
    }

    // Format context
    const context = topChunks
      .map((c) => `[Source: ${c.documentTitle}]\n${c.chunkText}`)
      .join('\n\n---\n\n');

    return context;
  } catch (error) {
    console.error('RAG retrieval error:', error.message);
    return '';
  }
};

module.exports = { retrieveRelevantContext };


