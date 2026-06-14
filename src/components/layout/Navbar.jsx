import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Manga<span>Flux</span>
        </Link>

        <div className="navbar-links">
          <Link to="/explore">Explore</Link>
          <Link to="/trending">Trending</Link>
          <Link to="/genres">Genres</Link>
        </div>

        <div className="navbar-right">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="navbar-search-form">
              <input
                autoFocus
                className="input"
                placeholder="Search manga..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)}>✕</button>
            </form>
          ) : (
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          )}

          {user ? (
            <div className="navbar-user">
              <Link to="/profile" className="user-avatar">
                {user.avatar ? <img src={user.avatar} alt={user.username} /> : user.username[0].toUpperCase()}
              </Link>
              {(user.role === 'admin' || user.role === 'owner') && (
                <Link to="/admin" className="btn btn-sm btn-ghost">Admin</Link>
              )}
              <button onClick={logout} className="btn btn-sm btn-ghost">Logout</button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
