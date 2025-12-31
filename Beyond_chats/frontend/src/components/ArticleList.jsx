import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import articleService from '../services/api'
import ArticleCard from './ArticleCard'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import './ArticleList.css'

const ArticleList = () => {
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'original', 'enhanced'

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    filterArticles()
  }, [articles, filter])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await articleService.getAllArticles()
      setArticles(data)
    } catch (err) {
      setError(err.message || 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const filterArticles = () => {
    if (filter === 'all') {
      setFilteredArticles(articles)
    } else if (filter === 'enhanced') {
      setFilteredArticles(articles.filter(articleService.isEnhancedArticle))
    } else if (filter === 'original') {
      setFilteredArticles(articles.filter(a => !articleService.isEnhancedArticle(a)))
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchArticles} />
  }

  const groupedArticles = articleService.groupArticlesByTitle(filteredArticles)
  const enhancedCount = articles.filter(articleService.isEnhancedArticle).length
  const originalCount = articles.length - enhancedCount

  return (
    <div className="article-list">
      <div className="article-list-header">
        <div className="header-content">
          <h2>Articles</h2>
          <div className="stats">
            <span className="stat-item">Total: {articles.length}</span>
            <span className="stat-item">Original: {originalCount}</span>
            <span className="stat-item">Enhanced: {enhancedCount}</span>
          </div>
        </div>
        
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Articles
          </button>
          <button
            className={`filter-tab ${filter === 'original' ? 'active' : ''}`}
            onClick={() => setFilter('original')}
          >
            Original
          </button>
          <button
            className={`filter-tab ${filter === 'enhanced' ? 'active' : ''}`}
            onClick={() => setFilter('enhanced')}
          >
            Enhanced
          </button>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="empty-state">
          <p>No articles found. {filter !== 'all' && `Try changing the filter.`}</p>
        </div>
      ) : (
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ArticleList

