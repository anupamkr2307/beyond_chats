/**
 * API Service
 * Handles all API interactions with the articles CRUD API
 */

import axios from 'axios';
import { config } from '../config.js';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch all articles from the API
 */
export async function fetchArticles() {
  try {
    const response = await apiClient.get('');
    
    if (response.data.success && response.data.articles) {
      return response.data.articles;
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.error || error.message}`);
    }
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }
}

/**
 * Fetch a specific article by ID
 */
export async function fetchArticleById(articleId) {
  try {
    const response = await apiClient.get(`/${articleId}`);
    
    if (response.data.success && response.data.article) {
      return response.data.article;
    }
    
    throw new Error('Article not found');
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.error || error.message}`);
    }
    throw new Error(`Failed to fetch article: ${error.message}`);
  }
}

/**
 * Publish a new article via POST
 */
export async function publishArticle(articleData) {
  try {
    const response = await apiClient.post('', articleData);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to publish article');
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.error || error.message}`);
    }
    throw new Error(`Failed to publish article: ${error.message}`);
  }
}

/**
 * Update an existing article
 */
export async function updateArticle(articleId, articleData) {
  try {
    const response = await apiClient.put(`/${articleId}`, articleData);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to update article');
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.error || error.message}`);
    }
    throw new Error(`Failed to update article: ${error.message}`);
  }
}


