/**
 * Web Scraper Service
 * Scrapes main content from article URLs
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape article content from a URL
 * @param {string} url - The article URL to scrape
 * @returns {Promise<string>} The scraped article content
 */
export async function scrapeArticleContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();

    // Try multiple content selectors (in order of preference)
    const contentSelectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      '.article-body',
      '.post-body',
      '[role="article"]',
      'main article',
      'main .content',
      '.post',
      '#content'
    ];

    let content = '';
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Get text content from paragraphs
        const paragraphs = element.find('p');
        if (paragraphs.length > 0) {
          content = paragraphs
            .map((i, el) => $(el).text().trim())
            .get()
            .filter(text => text.length > 50) // Filter out very short paragraphs
            .join('\n\n');
          
          if (content.length > 500) { // Only use if we got substantial content
            break;
          }
        }
      }
    }

    // Fallback: try to get all paragraph text from body
    if (content.length < 500) {
      const allParagraphs = $('body p');
      if (allParagraphs.length > 0) {
        content = allParagraphs
          .map((i, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 50)
          .slice(0, 20) // Limit to first 20 paragraphs
          .join('\n\n');
      }
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .trim();

    return content;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.message}`);
    }
    throw new Error(`Scraping failed: ${error.message}`);
  }
}


