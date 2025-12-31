# Article Management Frontend

A modern, responsive React.js frontend application for displaying and managing articles. This application integrates with the Flask API backend to showcase both original and enhanced articles.

## Features

- 📰 **Article Listing**: View all articles in a beautiful grid layout
- 🔍 **Filtering**: Filter articles by "All", "Original", or "Enhanced"
- 📄 **Article Details**: View full article content with markdown rendering
- ✨ **Enhanced Articles**: Automatically identifies and highlights enhanced articles (with references)
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean, professional design with smooth animations

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Flask API running on `http://localhost:5001` (from `assignment.py`)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the `frontend` directory (optional):
```env
VITE_API_BASE_URL=http://localhost:5001/api/articles
```

If not provided, it defaults to `http://localhost:5001/api/articles`.

## Running the Application

1. **Start the Flask API** (in a separate terminal):
   ```bash
   python assignment.py
   ```
   The API should be running on `http://localhost:5001`

2. **Start the React development server**:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── ArticleList.jsx     # Main article listing page
│   │   ├── ArticleCard.jsx     # Article preview card
│   │   ├── ArticleDetail.jsx   # Full article view
│   │   ├── LoadingSpinner.jsx  # Loading state component
│   │   └── ErrorMessage.jsx    # Error state component
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## How It Works

1. **Article Detection**: The app identifies enhanced articles by checking if they contain a "References" section in the content.

2. **Filtering**: Users can filter articles to view:
   - All articles
   - Only original articles
   - Only enhanced articles

3. **Article Display**:
   - **List View**: Shows all articles in a responsive grid with preview cards
   - **Detail View**: Displays full article content with markdown rendering
   - **Related Articles**: Shows related articles (original/enhanced versions) when viewing an article

4. **API Integration**: Fetches articles from the Flask API endpoints:
   - `GET /api/articles` - Get all articles
   - `GET /api/articles/:id` - Get specific article

## Technologies Used

- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering
- **CSS3** - Styling with modern features

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

1. **CORS Errors**: Make sure your Flask API has CORS enabled. You may need to add:
   ```python
   from flask_cors import CORS
   CORS(app)
   ```

2. **Connection Refused**: Ensure the Flask API is running on port 5001

3. **Articles Not Loading**: Check browser console for errors and verify API endpoints

4. **Port Already in Use**: Change the port in `vite.config.js` if port 3000 is already in use

## Production Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be served by any static file server.

