import React from 'react';

// Footer component with copyright, links, and contact info
export default function Footer() {
  return (
    <footer style={{
      background: 'var(--mint)',
      padding: '24px 32px',
      marginTop: 'auto',
      borderTop: '1px solid rgba(0,0,0,0.05)'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        width: '100%'
      }}>
        {/* Left Side - Copyright and Links */}
        <div style={{display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', marginLeft: 0}}>
          <span style={{fontSize: 13, color: '#555'}}>
            © 2025 EasyLearn. All rights reserved.
          </span>
          <a href="/privacy" style={{fontSize: 13, color: '#555', textDecoration: 'none'}}>
            Privacy Police
          </a>
          <a href="/terms" style={{fontSize: 13, color: '#555', textDecoration: 'none'}}>
            Terms & Conditions
          </a>
        </div>

        {/* Right Side - Contact and Social Media */}
        <div style={{display: 'flex', alignItems: 'center', gap: 40, marginRight: 0}}>
          {/* Contact */}
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 12, color: '#666', marginBottom: 4}}>Contact us</div>
            <div style={{fontSize: 13, color: '#555'}}>easylearn@gmail.com</div>
          </div>

          {/* Social Media */}
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 12, color: '#666', marginBottom: 4}}>Follow us</div>
            <div style={{display: 'flex', gap: 12, alignItems: 'center', flexDirection: 'column'}}>
              <a href="https://www.instagram.com/easy_learn" target="_blank" rel="noopener noreferrer" style={{fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#555">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                easy_learn
              </a>
              <a href="https://www.facebook.com/easy_learn" target="_blank" rel="noopener noreferrer" style={{fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#555">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
                easy_learn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
