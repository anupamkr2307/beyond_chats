/**
 * Article Enhancer Script
 * 
 * This script:
 * 1. Fetches articles from the API
 * 2. Searches each article's title on Google
 * 3. Scrapes content from top 2 ranking articles
 * 4. Uses LLM to enhance the original article
 * 5. Publishes the enhanced article with citations
 */

import { fetchArticles } from './services/apiService.js';
import { searchGoogle } from './services/googleSearch.js';
import { scrapeArticleContent } from './services/scraper.js';
import { enhanceArticleWithLLM } from './services/llmService.js';
import { publishArticle } from './services/apiService.js';

async function main() {
  try {
    console.log('🚀 Starting Article Enhancement Process...\n');

    // Step 1: Fetch articles from API
    console.log('📥 Fetching articles from API...');
    const articles = await fetchArticles();
    
    if (!articles || articles.length === 0) {
      console.log('❌ No articles found. Exiting.');
      return;
    }

    console.log(`✅ Found ${articles.length} article(s)\n`);

    // Process each article
    for (const article of articles) {
      try {
        console.log(`\n📄 Processing: "${article.title}"`);
        console.log(`   ID: ${article.id}`);
        
        // Step 2: Search Google for the article title
        console.log('🔍 Searching Google...');
        const searchResults = await searchGoogle(article.title);
        
        if (!searchResults || searchResults.length < 2) {
          console.log('⚠️  Not enough search results found. Skipping this article.');
          continue;
        }

        console.log(`✅ Found ${searchResults.length} search results`);

        // Step 3: Scrape content from top 2 articles
        console.log('📥 Scraping content from top 2 articles...');
        const referenceArticles = [];
        
        for (let i = 0; i < Math.min(2, searchResults.length); i++) {
          const result = searchResults[i];
          console.log(`   Scraping: ${result.title}`);
          
          try {
            const content = await scrapeArticleContent(result.link);
            if (content) {
              referenceArticles.push({
                title: result.title,
                url: result.link,
                content: content
              });
              console.log(`   ✅ Successfully scraped ${content.length} characters`);
            } else {
              console.log(`   ⚠️  Failed to scrape content`);
            }
          } catch (error) {
            console.log(`   ❌ Error scraping: ${error.message}`);
          }
        }

        if (referenceArticles.length < 2) {
          console.log('⚠️  Could not scrape enough reference articles. Skipping enhancement.');
          continue;
        }

        // Step 4: Enhance article using LLM
        console.log('🤖 Enhancing article with LLM...');
        const enhancedContent = await enhanceArticleWithLLM(
          article.title,
          article.content || '',
          referenceArticles
        );

        if (!enhancedContent) {
          console.log('❌ Failed to enhance article. Skipping.');
          continue;
        }

        // Add citations at the bottom
        const citationsSection = '\n\n## References\n\n' +
          referenceArticles.map(ref => `- [${ref.title}](${ref.url})`).join('\n');
        
        const finalContent = enhancedContent + citationsSection;

        // Step 5: Publish the enhanced article
        console.log('📤 Publishing enhanced article...');
        const publishedArticle = await publishArticle({
          title: article.title,
          url: article.url || `https://example.com/articles/${article.id}`,
          content: finalContent,
          author: article.author || '',
          published_date: article.published_date || new Date().toISOString()
        });

        if (publishedArticle) {
          console.log(`✅ Successfully published article with ID: ${publishedArticle.article_id}`);
        } else {
          console.log('❌ Failed to publish article');
        }

      } catch (error) {
        console.error(`❌ Error processing article "${article.title}":`, error.message);
        continue;
      }
    }

    console.log('\n✨ Article enhancement process completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main();


