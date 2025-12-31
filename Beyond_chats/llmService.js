/**
 * LLM Service
 * Uses OpenAI API to enhance articles based on reference articles
 */

import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Enhance an article using LLM based on reference articles
 * @param {string} originalTitle - The original article title
 * @param {string} originalContent - The original article content
 * @param {Array} referenceArticles - Array of reference articles with title, url, and content
 * @returns {Promise<string>} The enhanced article content
 */
export async function enhanceArticleWithLLM(originalTitle, originalContent, referenceArticles) {
  try {
    if (!config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Prepare reference content summaries
    const referenceSummaries = referenceArticles.map((ref, index) => 
      `Reference Article ${index + 1}: "${ref.title}"\n` +
      `URL: ${ref.url}\n` +
      `Content Preview: ${ref.content.substring(0, 2000)}...`
    ).join('\n\n');

    const systemPrompt = `You are an expert content writer and SEO specialist. Your task is to enhance and rewrite articles to match the style, formatting, and quality of top-ranking articles on Google.

Guidelines:
1. Maintain the core message and information from the original article
2. Match the writing style, tone, and structure of the reference articles
3. Use similar formatting patterns (headings, paragraphs, lists)
4. Improve readability and engagement
5. Keep the content factual and accurate
6. Make it more comprehensive and valuable than the original
7. Use clear headings and subheadings
8. Write in a professional yet accessible tone`;

    const userPrompt = `Please enhance and rewrite the following article to match the style and quality of the top-ranking reference articles provided.

Original Article Title: "${originalTitle}"

Original Article Content:
${originalContent || '(No content provided)'}

Reference Articles (top-ranking articles on Google):
${referenceSummaries}

Please rewrite the article to:
1. Match the formatting and style of the reference articles
2. Improve clarity, structure, and readability
3. Make it more comprehensive and valuable
4. Use proper headings (H2, H3) to organize content
5. Write in a similar tone and style to the reference articles
6. Keep all important information from the original

Return only the enhanced article content (no meta information, no explanations, just the article text).`;

    console.log('   Calling OpenAI API...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Can also use 'gpt-3.5-turbo' for faster/cheaper results
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const enhancedContent = completion.choices[0].message.content.trim();
    
    if (!enhancedContent) {
      throw new Error('Empty response from LLM');
    }

    console.log(`   ✅ Generated enhanced content (${enhancedContent.length} characters)`);
    
    return enhancedContent;
  } catch (error) {
    if (error.response) {
      throw new Error(`OpenAI API Error: ${error.response.status} - ${error.message}`);
    }
    throw new Error(`LLM enhancement failed: ${error.message}`);
  }
}

