import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/articles'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const articleService = {
  /**
   * Fetch all articles
   */
  async getAllArticles() {
    try {
      const response = await api.get('')
      if (response.data.success) {
        return response.data.articles || []
      }
      throw new Error(response.data.error || 'Failed to fetch articles')
    } catch (error) {
      console.error('Error fetching articles:', error)
      throw error
    }
  },

  /**
   * Fetch a single article by ID
   */
  async getArticleById(id) {
    try {
      const response = await api.get(`/${id}`)
      if (response.data.success) {
        return response.data.article
      }
      throw new Error(response.data.error || 'Article not found')
    } catch (error) {
      console.error('Error fetching article:', error)
      throw error
    }
  },

  /**
   * Check if article is enhanced (has References section)
   */
  isEnhancedArticle(article) {
    if (!article.content) return false
    return article.content.includes('## References') || 
           article.content.includes('# References') ||
           article.content.includes('References')
  },

  /**
   * Group articles by title similarity (for original vs enhanced)
   */
  groupArticlesByTitle(articles) {
    const grouped = {}
    
    articles.forEach(article => {
      // Normalize title for grouping (lowercase, remove special chars)
      const normalizedTitle = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .substring(0, 50) // Use first 50 chars for grouping
      
      if (!grouped[normalizedTitle]) {
        grouped[normalizedTitle] = []
      }
      
      grouped[normalizedTitle].push(article)
    })
    
    // Sort articles in each group by ID (newer enhanced versions likely have higher IDs)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => b.id - a.id)
    })
    
    return grouped
  }
}

export default articleService

