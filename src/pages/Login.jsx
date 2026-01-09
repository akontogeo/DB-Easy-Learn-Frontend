import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const userData = await login(email);
      
      // Save user to context
      setUser(userData);
      
      // Redirect based on role
      if (userData.role === 'teacher') {
        navigate('/teacher/courses');
      } else {
        navigate(`/users/${userData.userId}`);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#b8e6d5'
    }}>
      <div className="card" style={{
        maxWidth: 450,
        width: '100%',
        margin: 20,
        padding: 48
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 16
        }}>
          <img
            src="/Logo.png"
            alt="EasyLearn"
            style={{ 
              width: 100, 
              height: 100, 
              objectFit: 'contain',
              border: '3px solid #2ea67a',
              borderRadius: '50%',
              padding: 8,
              background: '#f0f7ff'
            }}
          />
        </div>

        <h1 style={{
          marginTop: 0,
          marginBottom: 8,
          fontSize: 32,
          fontWeight: 600,
          textAlign: 'center',
          color: '#222'
        }}>
          Welcome Back
        </h1>
        <p style={{
          margin: '0 0 40px 0',
          textAlign: 'center',
          color: '#666',
          fontSize: 16
        }}>
          Sign in to continue to EasyLearn
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#333'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2ea67a'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {error && (
            <div style={{
              padding: 12,
              marginBottom: 24,
              background: '#ffe8e8',
              border: '2px solid #ff6b6b',
              borderRadius: 8,
              color: '#d32f2f',
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: 16,
              fontWeight: 600,
              color: 'white',
              background: loading ? '#ccc' : '#2ea67a',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(46, 166, 122, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
