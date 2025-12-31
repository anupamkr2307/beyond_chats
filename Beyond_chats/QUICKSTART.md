# Quick Start Guide - Article Enhancer

## Prerequisites
1. Node.js installed (v18+)
2. Python Flask API running (`python assignment.py`)
3. OpenAI API key

## Setup (One-time)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   API_BASE_URL=http://localhost:5001/api/articles
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

## Running

1. **Start the Flask API** (in a separate terminal):
   ```bash
   python assignment.py
   ```

2. **Run the enhancer script:**
   ```bash
   npm start
   ```

## What It Does

For each article from your API:
1. ✅ Searches Google for the article title
2. ✅ Finds top 2 blog/article results
3. ✅ Scrapes content from those articles
4. ✅ Uses GPT-4 to enhance the original article
5. ✅ Adds citations at the bottom
6. ✅ Publishes via POST /api/articles

## Troubleshooting

- **"ECONNREFUSED"**: Make sure Flask API is running on port 5001
- **"OPENAI_API_KEY is not set"**: Check your `.env` file
- **"Not enough search results"**: Some titles may not have enough Google results
- **Google search fails**: The `google-it` package may have rate limits - wait a few minutes and retry


