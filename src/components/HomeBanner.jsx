import React from 'react';

// Home page banner with background word cloud pattern
export default function HomeBanner(){
  const words = [
    'Programming', 'Digital Marketing', 'Data Science', 'Machine Learning',
    'Project Management', 'Economics and Finance', 'Programming', 
    'Digital Marketing', 'Programming', 'Data Science', 'Economics and Finance'
  ];

  return (
    <div style={{
      position: 'relative',
      minHeight: '500px',
      background: 'white',
      borderRadius: '12px',
      padding: '60px 40px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      {/* Background Word Cloud */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.08,
        fontSize: '28px',
        fontWeight: 600,
        color: '#333',
        padding: '20px',
        lineHeight: 1.8,
        overflow: 'hidden'
      }}>
        {words.map((word, i) => (
          <span 
            key={i} 
            style={{
              margin: '8px 16px',
              transform: `rotate(${(i % 3 - 1) * 5}deg)`,
              display: 'inline-block'
            }}
          >
            {word}
          </span>
        ))}
      </div>

      {/* Welcome Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'white',
        border: '3px solid #2ea67a',
        borderRadius: '12px',
        padding: '60px 80px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(46, 166, 122, 0.15)',
        maxWidth: '600px'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#2ea67a',
          fontWeight: 600,
          marginBottom: '12px',
          letterSpacing: '1px'
        }}>
          Learn Anytime, Anywhere!
        </div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#2ea67a',
          margin: '0 0 20px 0',
          letterSpacing: '-1px'
        }}>
          HELLO
        </h1>
        <h2 style={{
          fontSize: '42px',
          fontWeight: 700,
          color: '#2ea67a',
          margin: '0 0 30px 0',
          letterSpacing: '-0.5px'
        }}>
          EasyLearner!
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#555',
          margin: 0,
          lineHeight: 1.6
        }}>
          What new would you like to learn today?
        </p>
      </div>
    </div>
  );
}