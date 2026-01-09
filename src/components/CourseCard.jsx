import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Course card component - displays a course with thumbnail, title, and actions
 * Used in search results and course listings
 */
export default function CourseCard({course, actions, showLessons = false}){
  const lessons = course?.lessons || [];
  const hasLessons = showLessons && lessons.length > 0;
  
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      {/* Main card container with data-cy for E2E testing */}
      <div className="card" data-cy="course-card" style={{display:'flex',alignItems:'flex-start',gap:16}}>
        {/* Course thumbnail - shows first 2 letters of title */}
        <div style={{width:80,height:80,minWidth:80,background:'#eee',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:'bold'}}>
          {course?.course_title?.slice(0,2) || 'C'}
        </div>
        
        {/* Course info section */}
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{margin:'0 0 8px 0',fontSize:18}}>{course.course_title}</h3>
          {/* Description truncated to 120 characters */}
          <p style={{margin:0,color:'#666',fontSize:14,lineHeight:'1.5'}}>{course.course_description?.slice(0,120)}</p>
          {hasLessons && (
            <p style={{margin:'8px 0 0 0',fontSize:13,color:'#2ea67a',fontWeight:500}}>
              📚 {lessons.length} Lesson{lessons.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
        
        {/* Action buttons - custom actions only */}
        <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:140}}>
          {actions}
        </div>
      </div>
      
      {/* Lessons Cards - shown below main course card */}
      {hasLessons && (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
          gap:12,
          paddingLeft:20,
          borderLeft:'3px solid #e0e0e0'
        }}>
          {lessons.map((lesson, index) => (
            <div 
              key={index}
              className="card"
              style={{
                padding:16,
                display:'flex',
                flexDirection:'column',
                gap:8,
                background:'#fafafa',
                border:'1px solid #e0e0e0'
              }}
            >
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{
                  background:'#2ea67a',
                  color:'white',
                  width:28,
                  height:28,
                  borderRadius:'50%',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  fontSize:12,
                  fontWeight:'bold'
                }}>
                  {index + 1}
                </span>
                <h4 style={{margin:0,fontSize:15,fontWeight:600,color:'#222'}}>
                  {lesson.lesson_title}
                </h4>
              </div>
              
              {lesson.lesson_description && (
                <p style={{margin:0,fontSize:13,color:'#666',lineHeight:1.5}}>
                  {lesson.lesson_description}
                </p>
              )}
              
              <button
                onClick={() => alert(`Navigate to lesson: ${lesson.lesson_title}\n(To be implemented)`)}
                style={{
                  marginTop:8,
                  padding:'8px 16px',
                  fontSize:13,
                  fontWeight:500,
                  background:'white',
                  color:'#2ea67a',
                  border:'1px solid #2ea67a',
                  borderRadius:4,
                  cursor:'pointer',
                  transition:'all 0.2s'
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
                Go to Lesson →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
