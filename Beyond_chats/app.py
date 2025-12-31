"""
Assignment: Scrape articles from BeyondChats and create CRUD APIs
This module scrapes the 5 oldest articles from the last page of BeyondChats blogs
and provides CRUD operations via REST APIs.
"""

import os
import sqlite3
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import re

# Initialize Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)  # Enable CORS for React frontend

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), 'articles.db')

def get_db_connection():
    """Create and return a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_articles_db():
    """Initialize the articles database table."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT UNIQUE NOT NULL,
            content TEXT,
            author TEXT,
            published_date TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("Articles database initialized.")

def find_last_page(base_url):
    """
    Find the last page number by checking pagination links.
    Returns the last page number.
    """
    try:
        # Start from page 1 to understand pagination structure
        page = 1
        last_page = 1
        
        while True:
            url = f"{base_url}?page={page}" if page > 1 else base_url
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code != 200:
                break
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for pagination links - common patterns
            pagination_links = soup.find_all('a', href=True)
            page_numbers = []
            
            for link in pagination_links:
                href = link.get('href', '')
                # Check for page numbers in href or text
                if 'page=' in href or link.text.strip().isdigit():
                    # Extract page number
                    page_match = re.search(r'page=(\d+)', href)
                    if page_match:
                        page_numbers.append(int(page_match.group(1)))
                    elif link.text.strip().isdigit():
                        page_numbers.append(int(link.text.strip()))
            
            # Also check for pagination divs/classes
            pagination_divs = soup.find_all(['div', 'nav', 'ul'], class_=re.compile(r'pagination|page', re.I))
            for div in pagination_divs:
                links = div.find_all('a', href=True)
                for link in links:
                    href = link.get('href', '')
                    page_match = re.search(r'page=(\d+)', href)
                    if page_match:
                        page_numbers.append(int(page_match.group(1)))
                    elif link.text.strip().isdigit():
                        page_numbers.append(int(link.text.strip()))
            
            if page_numbers:
                potential_last = max(page_numbers)
                if potential_last > last_page:
                    last_page = potential_last
                else:
                    break
            else:
                # If no pagination found, check if current page has articles
                articles = soup.find_all(['article', 'div'], class_=re.compile(r'article|blog|post', re.I))
                if not articles:
                    break
            
            # Safety limit to avoid infinite loops
            if page > 100:
                break
                
            page += 1
        
        return max(1, last_page)
    except Exception as e:
        print(f"Error finding last page: {e}")
        return 1

def scrape_article_details(article_url):
    """
    Scrape detailed content from an individual article page.
    Returns a dictionary with article details.
    """
    try:
        response = requests.get(article_url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        if response.status_code != 200:
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title = ""
        title_tag = soup.find('h1') or soup.find('title')
        if title_tag:
            title = title_tag.get_text(strip=True)
        
        # Extract content - try multiple common selectors
        content = ""
        content_selectors = [
            {'class': re.compile(r'content|post-content|article-content|entry-content', re.I)},
            {'class': re.compile(r'post-body|article-body', re.I)},
            {'id': re.compile(r'content|post-content|article-content', re.I)},
        ]
        
        for selector in content_selectors:
            content_div = soup.find('div', selector)
            if content_div:
                # Get all paragraphs
                paragraphs = content_div.find_all('p')
                content = ' '.join([p.get_text(strip=True) for p in paragraphs])
                if content:
                    break
        
        # If no content found, try main/article tag
        if not content:
            main_tag = soup.find('main') or soup.find('article')
            if main_tag:
                paragraphs = main_tag.find_all('p')
                content = ' '.join([p.get_text(strip=True) for p in paragraphs])
        
        # Extract author
        author = ""
        author_selectors = [
            {'class': re.compile(r'author|byline|writer', re.I)},
            {'itemprop': 'author'},
        ]
        for selector in author_selectors:
            author_tag = soup.find(['span', 'div', 'a'], selector)
            if author_tag:
                author = author_tag.get_text(strip=True)
                break
        
        # Extract published date
        published_date = ""
        date_selectors = [
            {'class': re.compile(r'date|published|time', re.I)},
            {'itemprop': 'datePublished'},
            {'datetime': True},
        ]
        for selector in date_selectors:
            date_tag = soup.find(['time', 'span', 'div'], selector)
            if date_tag:
                published_date = date_tag.get('datetime') or date_tag.get_text(strip=True)
                if published_date:
                    break
        
        return {
            'title': title,
            'content': content,
            'author': author,
            'published_date': published_date
        }
    except Exception as e:
        print(f"Error scraping article {article_url}: {e}")
        return None

def scrape_articles_from_page(url, limit=5):
    """
    Scrape articles from a given page URL.
    Returns a list of article dictionaries.
    """
    try:
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        if response.status_code != 200:
            print(f"Failed to fetch page: {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        articles = []
        
        # Try multiple common article/blog post selectors
        article_selectors = [
            soup.find_all('article'),
            soup.find_all('div', class_=re.compile(r'article|blog|post', re.I)),
            soup.find_all('div', id=re.compile(r'article|blog|post', re.I)),
            soup.find_all(['div', 'section'], {'class': re.compile(r'card|item|entry', re.I)}),
        ]
        
        article_links = []
        
        for selector_result in article_selectors:
            for element in selector_result:
                # Find link to article
                link = element.find('a', href=True)
                if link:
                    href = link.get('href', '')
                    if href:
                        # Make absolute URL if relative
                        if href.startswith('/'):
                            base = '/'.join(url.split('/')[:3])
                            href = base + href
                        elif not href.startswith('http'):
                            href = url.rstrip('/') + '/' + href.lstrip('/')
                        
                        # Get title
                        title_elem = element.find(['h1', 'h2', 'h3', 'h4'])
                        title = title_elem.get_text(strip=True) if title_elem else link.get_text(strip=True)
                        
                        if href and title and href not in [a['url'] for a in article_links]:
                            article_links.append({
                                'url': href,
                                'title': title
                            })
        
        # If no articles found with common selectors, try finding all links
        if not article_links:
            all_links = soup.find_all('a', href=True)
            for link in all_links:
                href = link.get('href', '')
                text = link.get_text(strip=True)
                # Filter for blog/article links
                if ('/blog/' in href or '/article/' in href or '/post/' in href) and text:
                    if href.startswith('/'):
                        base = '/'.join(url.split('/')[:3])
                        href = base + href
                    elif not href.startswith('http'):
                        href = url.rstrip('/') + '/' + href.lstrip('/')
                    
                    if href not in [a['url'] for a in article_links]:
                        article_links.append({
                            'url': href,
                            'title': text
                        })
        
        # Get detailed content for each article
        for article_link in article_links[:limit]:
            details = scrape_article_details(article_link['url'])
            if details:
                article = {
                    'title': details.get('title') or article_link['title'],
                    'url': article_link['url'],
                    'content': details.get('content', ''),
                    'author': details.get('author', ''),
                    'published_date': details.get('published_date', '')
                }
                articles.append(article)
            else:
                # If details scraping fails, at least save the basic info
                articles.append({
                    'title': article_link['title'],
                    'url': article_link['url'],
                    'content': '',
                    'author': '',
                    'published_date': ''
                })
        
        return articles
    except Exception as e:
        print(f"Error scraping articles from {url}: {e}")
        return []

def scrape_and_store_articles():
    """
    Main function to scrape the 5 oldest articles from the last page
    and store them in the database.
    """
    base_url = "https://beyondchats.com/blogs/"
    
    print("Finding last page...")
    last_page = find_last_page(base_url)
    print(f"Last page found: {last_page}")
    
    # Construct URL for last page
    if last_page > 1:
        last_page_url = f"{base_url}?page={last_page}"
    else:
        last_page_url = base_url
    
    print(f"Scraping articles from: {last_page_url}")
    articles = scrape_articles_from_page(last_page_url, limit=5)
    
    if not articles:
        print("No articles found. Trying alternative approach...")
        # Try direct access to the base URL
        articles = scrape_articles_from_page(base_url, limit=5)
    
    # Store articles in database
    conn = get_db_connection()
    cur = conn.cursor()
    
    stored_count = 0
    for article in articles:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO articles (title, url, content, author, published_date)
                VALUES (?, ?, ?, ?, ?)
            """, (
                article['title'],
                article['url'],
                article['content'],
                article['author'],
                article['published_date']
            ))
            stored_count += 1
        except Exception as e:
            print(f"Error storing article {article['title']}: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"Successfully stored {stored_count} articles in database.")
    return stored_count

# ==================== CRUD API ENDPOINTS ====================

@app.route('/api/articles', methods=['GET'])
def get_articles():
    """Get all articles (READ)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Optional query parameters
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)
        
        query = "SELECT * FROM articles ORDER BY id DESC"
        params = []
        
        if limit:
            query += " LIMIT ? OFFSET ?"
            params = [limit, offset]
        
        cur.execute(query, params)
        articles = cur.fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'count': len(articles),
            'articles': [dict(article) for article in articles]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Get a specific article by ID (READ)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
        article = cur.fetchone()
        conn.close()
        
        if article:
            return jsonify({
                'success': True,
                'article': dict(article)
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Article not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/articles', methods=['POST'])
def create_article():
    """Create a new article (CREATE)."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('title') or not data.get('url'):
            return jsonify({
                'success': False,
                'error': 'Title and URL are required'
            }), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO articles (title, url, content, author, published_date)
            VALUES (?, ?, ?, ?, ?)
        """, (
            data.get('title'),
            data.get('url'),
            data.get('content', ''),
            data.get('author', ''),
            data.get('published_date', '')
        ))
        
        article_id = cur.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Article created successfully',
            'article_id': article_id
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({
            'success': False,
            'error': 'Article with this URL already exists'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/articles/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    """Update an existing article (UPDATE)."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if article exists
        cur.execute("SELECT id FROM articles WHERE id = ?", (article_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Article not found'
            }), 404
        
        # Build update query dynamically based on provided fields
        update_fields = []
        values = []
        
        if 'title' in data:
            update_fields.append("title = ?")
            values.append(data['title'])
        if 'url' in data:
            update_fields.append("url = ?")
            values.append(data['url'])
        if 'content' in data:
            update_fields.append("content = ?")
            values.append(data['content'])
        if 'author' in data:
            update_fields.append("author = ?")
            values.append(data['author'])
        if 'published_date' in data:
            update_fields.append("published_date = ?")
            values.append(data['published_date'])
        
        if not update_fields:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'No valid fields to update'
            }), 400
        
        values.append(article_id)
        query = f"UPDATE articles SET {', '.join(update_fields)} WHERE id = ?"
        
        cur.execute(query, values)
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Article updated successfully'
        }), 200
    except sqlite3.IntegrityError:
        return jsonify({
            'success': False,
            'error': 'Article with this URL already exists'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    """Delete an article (DELETE)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if article exists
        cur.execute("SELECT id FROM articles WHERE id = ?", (article_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Article not found'
            }), 404
        
        cur.execute("DELETE FROM articles WHERE id = ?", (article_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Article deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/articles/scrape', methods=['POST'])
def scrape_articles_endpoint():
    """Endpoint to trigger article scraping."""
    try:
        count = scrape_and_store_articles()
        return jsonify({
            'success': True,
            'message': f'Successfully scraped and stored {count} articles',
            'count': count
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/articles/stats', methods=['GET'])
def get_stats():
    """Get statistics about stored articles."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) as total FROM articles")
        total = cur.fetchone()['total']
        
        cur.execute("SELECT COUNT(*) as with_content FROM articles WHERE content != '' AND content IS NOT NULL")
        with_content = cur.fetchone()['with_content']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_articles': total,
                'articles_with_content': with_content,
                'articles_without_content': total - with_content
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Initialize database
    init_articles_db()
    
    # Scrape articles on startup
    print("Starting article scraping...")
    scrape_and_store_articles()
    
    # Run Flask app
    print("Starting Flask server on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)


