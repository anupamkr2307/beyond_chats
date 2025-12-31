import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import articleService from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import './ArticleDetail.css'

const ArticleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [allArticles, setAllArticles] = useState([])
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchArticle()
    fetchAllArticles()
  }, [id])

  useEffect(() => {
    findRelatedArticles()
  }, [article, allArticles])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await articleService.getArticleById(id)
      setArticle(data)
    } catch (err) {
      setError(err.message || 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllArticles = async () => {
    try {
      const data = await articleService.getAllArticles()
      setAllArticles(data)
    } catch (err) {
      console.error('Error fetching all articles:', err)
    }
  }

  const findRelatedArticles = () => {
    if (!article || !allArticles.length) return

    // Find articles with similar titles (original vs enhanced versions)
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .substring(0, 50)

    const related = allArticles
      .filter(a => {
        const aTitle = a.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .substring(0, 50)
        return a.id !== article.id && aTitle === normalizedTitle
      })
      .slice(0, 5)

    setRelatedArticles(related)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchArticle} />
  }

  if (!article) {
    return <ErrorMessage message="Article not found" />
  }

  const isEnhanced = articleService.isEnhancedArticle(article)

  return (
    <div className="article-detail">
      <div className="article-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <div className="article-badge">
          {isEnhanced ? (
            <span className="badge badge-enhanced">✨ Enhanced Article</span>
          ) : (
            <span className="badge badge-original">📄 Original Article</span>
          )}
        </div>
      </div>

      <article className="article-content">
        <header className="article-header">
          <h1>{article.title}</h1>
          <div className="article-meta">
            {article.author && (
              <span className="meta-item">
                <strong>Author:</strong> {article.author}
              </span>
            )}
            {article.published_date && (
              <span className="meta-item">
                <strong>Published:</strong>{' '}
                {new Date(article.published_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="meta-item link"
              >
                View Original URL →
              </a>
            )}
          </div>
        </header>

        <div className="article-body">
          {article.content ? (
            <ReactMarkdown className="markdown-content">
              {article.content}
            </ReactMarkdown>
          ) : (
            <p className="no-content">No content available for this article.</p>
          )}
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <div className="related-articles">
          <h2>Related Articles</h2>
          <div className="related-list">
            {relatedArticles.map(related => (
              <Link
                key={related.id}
                to={`/article/${related.id}`}
                className="related-card"
              >
                <div className="related-header">
                  {articleService.isEnhancedArticle(related) ? (
                    <span className="badge badge-enhanced">Enhanced</span>
                  ) : (
                    <span className="badge badge-original">Original</span>
                  )}
                </div>
                <h3>{related.title}</h3>
                <p>
                  {related.content
                    ? related.content.substring(0, 100) + '...'
                    : 'No preview available'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticleDetail

