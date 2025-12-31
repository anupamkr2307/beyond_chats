import React from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>📰 Article Management</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            All Articles
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

