import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const debounceTimer = useRef(null);
  const isHomePage = location.pathname === '/' || location.pathname === '/courses';
  const isTeacher = user?.role === 'teacher';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Initialize search keyword from URL params
  React.useEffect(() => {
    const keyword = searchParams.get('keyword');
    if (keyword) {
      setSearchKeyword(decodeURIComponent(keyword));
    }
  }, [searchParams]);

  const performSearch = (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/courses?keyword=${encodeURIComponent(trimmed)}`);
    } else {
      // If search is empty, go back to home with no filters
      navigate('/courses');
    }
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchKeyword(newValue);

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounce timer - search after 300ms of no typing
    debounceTimer.current = setTimeout(() => {
      performSearch(newValue);
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Clear any pending debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    performSearch(searchKeyword);
  };

  const handleSearchClear = () => {
    setSearchKeyword('');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    navigate('/courses');
  };

  return (
    <header
      style={{
        background: '#b8e6d5',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      }}
    >
      {/* Logo */}
      <Link
        to={isTeacher ? "/teacher/courses" : "/"}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: '#2ea67a',
          fontWeight: 700,
          fontSize: '18px',
          whiteSpace: 'nowrap',
        }}
      >
        <img
          src="/Logo.png"
          alt="EasyLearn"
          style={{ width: 40, height: 40, objectFit: 'contain' }}
        />
        EasyLearn
      </Link>

      {/* Search Bar - Only for students */}
      {!isTeacher && (
        <form
          onSubmit={handleSearch}
          data-cy="search-form"
          style={{
            flex: 1,
            maxWidth: '600px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            data-cy="search-input"
            type="text"
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(e);
            }}
            placeholder="What do you want to learn today?"
            data-cy="search-input"
            style={{
              width: '100%',
              padding: '10px 40px 10px 16px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
            }}
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={handleSearchClear}
              style={{
                position: 'absolute',
                right: '40px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#999',
                fontSize: '18px',
                lineHeight: 1,
              }}
              title="Clear search"
            >
              ×
            </button>
          )}
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </form>
      )}

      {/* Right Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginLeft: 'auto',
        }}
      >
        {!isTeacher && (
          <Link
            to={user ? `/users/${user.userId}` : '/users/1'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: '#333',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              👤
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Hi, {user?.username || 'User'}!
            </span>
          </Link>
        )}

        {isTeacher && (
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: '#333',
            }}
          >
            👨‍🏫 {user?.username || 'Teacher'}
          </span>
        )}

        <button
          onClick={handleLogout}
          style={{
            background: 'white',
            color: '#2ea67a',
            border: '2px solid #2ea67a',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#2ea67a';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'white';
            e.target.style.color = '#2ea67a';
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
