# Article Enhancer - Node.js Project

This Node.js script enhances articles by:
1. Fetching articles from the CRUD API
2. Searching each article's title on Google
3. Scraping content from the top 2 ranking articles
4. Using an LLM (OpenAI) to enhance the original article to match the style and quality of top-ranking articles
5. Publishing the enhanced article with citations via the CRUD API

## Prerequisites

- Node.js (v18 or higher recommended)
- Python Flask API running on `http://localhost:5001` (from the previous assignment)
- OpenAI API Key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root:
```env
API_BASE_URL=http://localhost:5001/api/articles
OPENAI_API_KEY=your_openai_api_key_here
```

## Configuration

Edit the `.env` file or `config.js` to configure:
- `API_BASE_URL`: Base URL for the articles CRUD API (default: `http://localhost:5001/api/articles`)
- `OPENAI_API_KEY`: Your OpenAI API key (required for LLM enhancement)

## Usage

1. Make sure the Flask API server is running (from `assignment.py`):
```bash
python assignment.py
```

2. Run the article enhancer script:
```bash
npm start
```

Or in development mode with auto-reload:
```bash
npm run dev
```

## How It Works

1. **Fetch Articles**: Retrieves all articles from the GET `/api/articles` endpoint
2. **Google Search**: For each article, searches Google using the article title
3. **Filter Results**: Filters search results to find blog/article URLs (excludes social media, videos, etc.)
4. **Scrape Content**: Scrapes the main content from the top 2 ranking articles
5. **LLM Enhancement**: Uses OpenAI GPT-4 to rewrite the original article, matching the style and formatting of the reference articles
6. **Add Citations**: Adds a "References" section at the bottom with links to the scraped articles
7. **Publish**: Publishes the enhanced article via POST `/api/articles`

## Project Structure

```
.
├── index.js                  # Main entry point
├── config.js                 # Configuration management
├── package.json              # Node.js dependencies
├── services/
│   ├── apiService.js         # CRUD API interactions
│   ├── googleSearch.js       # Google search functionality
│   ├── scraper.js            # Web scraping service
│   └── llmService.js         # OpenAI LLM integration
└── README_ARTICLE_ENHANCER.md # This file
```

## Dependencies

- **axios**: HTTP client for API requests
- **cheerio**: Server-side HTML parsing and manipulation (for web scraping)
- **google-it**: Google search library
- **openai**: OpenAI API client
- **dotenv**: Environment variable management

## Error Handling

The script includes comprehensive error handling:
- Skips articles if search results are insufficient
- Continues processing other articles if one fails
- Provides detailed error messages in the console
- Handles API errors, scraping failures, and LLM errors gracefully

## Notes

- The script processes articles sequentially to avoid rate limiting
- Google search results are filtered to exclude non-article domains
- Web scraping uses multiple content selectors to extract article text
- The LLM uses GPT-4 Turbo for high-quality article enhancement
- Citations are automatically added at the bottom of each enhanced article

## Troubleshooting

1. **"OPENAI_API_KEY is not set"**: Make sure you've created a `.env` file with your OpenAI API key
2. **"API Error: ECONNREFUSED"**: Make sure the Flask API server is running on port 5001
3. **"Not enough search results"**: Some article titles may not return enough blog/article results on Google
4. **Scraping failures**: Some websites may block automated scraping or use non-standard HTML structures


