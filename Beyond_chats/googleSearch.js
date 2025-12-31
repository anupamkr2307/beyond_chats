/**
 * Google Search Service
 * Searches Google for article titles and returns relevant blog/article links
 */

import googleIt from 'google-it';

/**
 * Search Google for a query and return blog/article links
 * @param {string} query - The search query (article title)
 * @returns {Promise<Array>} Array of search results with title, link, and snippet
 */
export async function searchGoogle(query) {
  try {
    console.log(`   Searching for: "${query}"`);
    
    const results = await googleIt({
      query: query,
      options: {
        limit: 10, // Get more results to filter for blogs/articles
      }
    });

    // Filter for blog/article URLs (exclude social media, videos, etc.)
    const blogResults = results
      .filter(result => {
        const link = result.link.toLowerCase();
        // Exclude common non-article domains
        const excludedDomains = [
          'youtube.com',
          'twitter.com',
          'facebook.com',
          'linkedin.com',
          'instagram.com',
          'pinterest.com',
          'reddit.com',
          'wikipedia.org',
          'amazon.com',
          'ebay.com',
          'google.com/maps',
          'youtu.be'
        ];
        
        // Check if it's likely a blog/article
        const isBlogArticle = 
          link.includes('/blog/') ||
          link.includes('/article/') ||
          link.includes('/post/') ||
          link.includes('/news/') ||
          link.includes('/story/') ||
          link.includes('/content/') ||
          (!excludedDomains.some(domain => link.includes(domain)) && 
           (link.match(/\/[a-z0-9-]+-[a-z0-9-]+\.html/) || 
            link.match(/\/\d{4}\/\d{2}\//) || // Date-based URLs
            link.split('/').length > 4)); // Deep URLs often indicate articles
        
        return isBlogArticle;
      })
      .slice(0, 2) // Get top 2 results
      .map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet
      }));

    return blogResults;
  } catch (error) {
    console.error('Google search error:', error.message);
    throw new Error(`Google search failed: ${error.message}`);
  }
}


