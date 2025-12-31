# Complete Project Integration Guide

This document explains how to run the complete article management system with all three phases integrated.

## Project Overview

The complete system consists of three components:

1. **Flask API Backend** (`assignment.py`) - CRUD APIs for articles
2. **Node.js Article Enhancer** (`index.js`) - Enhances articles using Google search and LLM
3. **React Frontend** (`frontend/`) - Displays articles in a beautiful UI

## System Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│   (Display)     │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│   Flask API     │ (Port 5001)
│   (CRUD APIs)   │
└────────┬────────┘
         │ SQLite
         ▼
┌─────────────────┐
│  articles.db    │
│   (Database)    │
└─────────────────┘

┌─────────────────┐
│ Node.js Script  │ (Enhancer)
│  (Enhancement)  │
└────────┬────────┘
         │
         ├─→ Google Search
         ├─→ Web Scraping
         └─→ OpenAI LLM
```

## Setup Instructions

### Step 1: Python Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Flask API:**
   ```bash
   python assignment.py
   ```
   The API will run on `http://localhost:5001`

### Step 2: Node.js Enhancer Setup (Optional - for article enhancement)

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   API_BASE_URL=http://localhost:5001/api/articles
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the enhancer script** (when you want to enhance articles):
   ```bash
   npm start
   ```

### Step 3: React Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional):**
   ```env
   VITE_API_BASE_URL=http://localhost:5001/api/articles
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## Complete Workflow

### Phase 1: Initial Article Scraping
1. Start Flask API: `python assignment.py`
2. The API automatically scrapes 5 articles from BeyondChats on startup
3. Articles are stored in SQLite database (`articles.db`)

### Phase 2: Article Enhancement (Optional)
1. Make sure Flask API is running
2. Run the Node.js enhancer: `npm start`
3. The script will:
   - Fetch articles from the API
   - Search Google for each article title
   - Scrape top 2 ranking articles
   - Use OpenAI to enhance the article
   - Publish enhanced version via API
4. Enhanced articles are stored as new entries in the database

### Phase 3: Frontend Display
1. Make sure Flask API is running
2. Start React frontend: `cd frontend && npm run dev`
3. Open browser to `http://localhost:3000`
4. View all articles (original and enhanced)
5. Filter by Original/Enhanced
6. Click on articles to view full content

## API Endpoints

The Flask API provides the following endpoints:

- `GET /api/articles` - Get all articles
- `GET /api/articles/<id>` - Get specific article
- `POST /api/articles` - Create new article
- `PUT /api/articles/<id>` - Update article
- `DELETE /api/articles/<id>` - Delete article
- `POST /api/articles/scrape` - Trigger article scraping
- `GET /api/articles/stats` - Get article statistics

## Features

### Frontend Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Article listing with filter (All/Original/Enhanced)
- ✅ Article detail view with markdown rendering
- ✅ Badge indicators for original vs enhanced articles
- ✅ Related articles suggestions
- ✅ Loading and error states
- ✅ Modern, professional UI

### Backend Features
- ✅ RESTful CRUD APIs
- ✅ SQLite database
- ✅ CORS enabled for frontend access
- ✅ Article scraping from BeyondChats
- ✅ Article enhancement with LLM

## Troubleshooting

### CORS Errors
- Make sure `flask-cors` is installed: `pip install flask-cors`
- The Flask app should have `CORS(app)` enabled (already added)

### Port Conflicts
- Flask API: Change port in `assignment.py` (line 616)
- React Frontend: Change port in `frontend/vite.config.js`

### API Connection Issues
- Verify Flask API is running: `curl http://localhost:5001/api/articles`
- Check API base URL in frontend `.env` file
- Check browser console for specific errors

### Database Issues
- Delete `articles.db` to reset the database
- Restart Flask API to reinitialize

## Quick Start (All Services)

```bash
# Terminal 1: Flask API
python assignment.py

# Terminal 2: Node.js Enhancer (optional)
npm start

# Terminal 3: React Frontend
cd frontend
npm run dev
```

## Production Deployment

### Backend
- Use Gunicorn or uWSGI for Flask
- Set up proper CORS configuration
- Use PostgreSQL instead of SQLite for production

### Frontend
- Build: `cd frontend && npm run build`
- Serve the `dist/` folder with nginx or any static file server
- Configure API base URL for production

## Project Structure

```
Auto_Mind/
├── assignment.py           # Flask API backend
├── articles.db             # SQLite database
├── requirements.txt        # Python dependencies
├── index.js               # Node.js enhancer script
├── package.json           # Node.js dependencies
├── config.js              # Node.js config
├── services/              # Node.js services
│   ├── apiService.js
│   ├── googleSearch.js
│   ├── scraper.js
│   └── llmService.js
└── frontend/              # React frontend
    ├── src/
    │   ├── components/
    │   ├── services/
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

## Next Steps

1. ✅ All three phases are integrated and working
2. Frontend displays both original and enhanced articles
3. Users can filter and view articles easily
4. System is ready for use!

Enjoy your complete article management system! 🎉

