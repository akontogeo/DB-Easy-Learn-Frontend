import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Course details page - show course info and enroll/review options
import { getCourse, getCourseAverageRating } from '../api/courses';
import { getUserEnrolledCourses, enrollInCourse } from '../api/users';
import { useAuth } from '../context/AuthContext';

export default function CourseDetails(){
  // Handle course details for both enrolled and non-enrolled views
  const { id, courseId, userId } = useParams();
  const navigate = useNavigate();
  // Use courseId if available (from /users/:userId/courses/:courseId), otherwise use id (from /courses/:id)
  const actualCourseId = courseId || id;
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(()=>{
    async function load(){
      try{
        setLoading(true);
        const c = await getCourse(actualCourseId);
        setCourse(c);
        
        // Fetch average rating from backend
        const ratingData = await getCourseAverageRating(actualCourseId);
        setAvgRating(ratingData.averageRating || 'N/A');
        setTotalReviews(ratingData.totalReviews || 0);

        // Check if user is enrolled (only when accessed via /courses/:id route)
        // If userId is in params, we shouldn't be here - let the router handle it
        if(!userId){
          const currentUserId = user?.userId;
          if(currentUserId){
            const enrolledCourses = await getUserEnrolledCourses(currentUserId);
            const enrolled = enrolledCourses.some(ec => Number(ec.course_id || ec.id) === Number(actualCourseId));
            
            // If user is enrolled, redirect to the enrolled course view
            if(enrolled){
              navigate(`/users/${currentUserId}/courses/${actualCourseId}`);
              return;
            }
            setIsEnrolled(enrolled);
          }
        }
      }catch(e){
        console.error('Failed to load course:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  },[actualCourseId, userId, user]);

  const handleEnroll = async () => {
    const currentUserId = userId || user?.userId;
    if(!currentUserId){
      alert('Please log in to enroll');
      return;
    }
    
    try{
      setEnrolling(true);
      await enrollInCourse(currentUserId, actualCourseId);
      // Navigate with state to indicate fresh enrollment
      navigate(`/users/${currentUserId}/courses/${actualCourseId}`, { 
        state: { justEnrolled: true } 
      });
    }catch(e){
      alert('Failed to enroll: ' + (e.response?.data?.message || e.message));
    }finally{
      setEnrolling(false);
    }
  };

  if(loading){
    return <div className="card">Loading course...</div>;
  }

  if(!course){
    return <div className="card">Course not found</div>;
  }

  return (
    <div style={{maxWidth: '800px', margin: '0 auto', width: '100%', padding: '40px 20px'}}>
      {/* Simplified Course Card - title, image, rating, enroll button only */}
      <div className="card" style={{padding: 40, textAlign: 'center'}}>
        {/* Course Image */}
        <div style={{
          width: 200, 
          height: 200, 
          background: '#f0f0f0', 
          borderRadius: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px',
          overflow: 'hidden',
          border: '3px solid #e0e0e0'
        }}>
          {course.courseImage ? (
            <img src={course.courseImage} alt={course.course_title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <div style={{fontSize: 72, fontWeight: 'bold', color: '#999'}}>
              {course.course_title?.slice(0,2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Course Title */}
        <h1 data-cy="course-title" style={{
          margin: '0 0 16px 0', 
          fontSize: 36, 
          fontWeight: 700,
          color: '#222'
        }}>
          {course.course_title}
        </h1>

        {/* Course Description */}
        <p style={{
          margin: '0 0 32px 0',
          fontSize: 16,
          lineHeight: 1.6,
          color: '#555',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {course.course_description}
        </p>

        {/* Average Rating */}
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 12,
          marginBottom: 32
        }}>
          <span style={{fontSize: 32, lineHeight: 1}}>⭐</span>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <span style={{fontSize: 28, fontWeight: 600, color: '#222'}}>{avgRating}</span>
            <span style={{fontSize: 14, color: '#666'}}>({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>

        {/* Enroll Button */}
        {!isEnrolled && (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <button
              data-cy="enroll-button" 
              onClick={handleEnroll}
              disabled={enrolling}
              style={{
                background: enrolling ? '#ccc' : 'var(--accent)',
                color: 'white',
                padding: '16px 64px',
                fontSize: 18,
                fontWeight: 600,
                border: 'none',
                borderRadius: 8,
                cursor: enrolling ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(46, 166, 122, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {enrolling ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        )}
        
        {isEnrolled && (
          <div data-cy="enroll-success" style={{display: 'flex', justifyContent: 'center'}}>
            <span style={{
              color: 'var(--accent)',
              fontSize: 18,
              fontWeight: 600,
              padding: '16px 32px',
              background: '#e8f5f0',
              borderRadius: 8
            }}>
              ✓ Already Enrolled
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
