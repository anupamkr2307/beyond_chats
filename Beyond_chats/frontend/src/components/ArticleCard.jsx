import React from 'react'
import { Link } from 'react-router-dom'
import articleService from '../services/api'
import './ArticleCard.css'

const ArticleCard = ({ article }) => {
  const isEnhanced = articleService.isEnhancedArticle(article)
  const contentPreview = article.content 
    ? article.content.substring(0, 150).replace(/\n/g, ' ') + '...'
    : 'No content available'

  return (
    <div className={`article-card ${isEnhanced ? 'enhanced' : ''}`}>
      <div className="article-card-header">
        <div className="article-badge">
          {isEnhanced ? (
            <span className="badge badge-enhanced">✨ Enhanced</span>
          ) : (
            <span className="badge badge-original">📄 Original</span>
          )}
        </div>
        {article.published_date && (
          <span className="article-date">
            {new Date(article.published_date).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <h3 className="article-title">{article.title}</h3>
      
      <p className="article-preview">{contentPreview}</p>
      
      <div className="article-card-footer">
        {article.author && (
          <span className="article-author">By {article.author}</span>
        )}
        <Link to={`/article/${article.id}`} className="read-more-btn">
          Read More →
        </Link>
      </div>
    </div>
  )
}

export default ArticleCard

