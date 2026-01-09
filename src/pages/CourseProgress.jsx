import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';

// Course progress page - lessons, quizzes, reviews, and ratings
import { getCourse, submitCourseReview, getCourseReviews } from '../api/courses';
import { getUserEnrolledCourses, enrollInCourse, withdrawFromCourse, getCourseScore } from '../api/users';
import { getCourseLessons } from '../api/lessons';
import { getCourseQuizzes } from '../api/quizzes';
import { useAuth } from '../context/AuthContext';

export default function CourseProgress(){
  // Manage user progress, lessons, quizzes, and course reviews
  const { userId, courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState(new Set());
  const [courseScore, setCourseScore] = useState(null);

  useEffect(() => {
    async function load(){
      try{
        setLoading(true);
        
        // Check if we just enrolled from CourseDetails
        const justEnrolled = location.state?.justEnrolled;
        
        // Set current user from URL
        const { getUserProfile } = await import('../api/users');
        const profile = await getUserProfile(userId);
        setUser({ ...profile, userId: Number(userId) });
        
        // Load course details
        const courseData = await getCourse(courseId);
        setCourse(courseData);
        
        // Load lessons
        const lessonsData = await getCourseLessons(courseId);
        setLessons(lessonsData || []);
        
        // Load quizzes
        const quizzesData = await getCourseQuizzes(courseId);
        setQuizzes(quizzesData || []);
        
        // Load completed quizzes from localStorage
        const completedKey = `completed_quizzes_user_${userId}_course_${courseId}`;
        const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
        setCompletedQuizzes(new Set(completed));
        
        // Load course score
        try {
          const scoreData = await getCourseScore(userId, courseId);
          setCourseScore(scoreData);
        } catch (err) {
          console.error('Failed to load course score:', err);
        }
        
        // Load reviews and check if user has already reviewed
        const reviewsData = await getCourseReviews(courseId);
        setReviews(reviewsData || []);
        const hasReviewed = reviewsData.some(r => Number(r.student_id) === Number(userId));
        setUserHasReviewed(hasReviewed);
        
        // If just enrolled, set as enrolled immediately
        if (justEnrolled) {
          setIsEnrolled(true);
        } else {
          // Otherwise check enrollment status
          const enrolledCourses = await getUserEnrolledCourses(userId);
          const enrolled = enrolledCourses.some(c => Number(c.course_id || c.id) === Number(courseId));
          
          setIsEnrolled(enrolled);
        }
      }catch(e){
        console.error('Failed to load course progress:', e);
      }finally{
        setLoading(false);
      }
    }
    load();
  }, [userId, courseId, setUser, location.state]);

  if(loading){
    return <div className="card">Loading...</div>;
  }

  if(!course){
    return <div className="card">Course not found</div>;
  }

  async function handleEnroll() {
    if (enrolling) return;
    try {
      setEnrolling(true);
      await enrollInCourse(userId, courseId);
      setIsEnrolled(true);
    } catch (e) {
      console.error('Failed to enroll:', e);
    } finally {
      setEnrolling(false);
    }
  }

  async function handleWithdraw() {
    if (!window.confirm(`Are you sure you want to withdraw from "${course.course_title}"? Your progress will be lost.`)) {
      return;
    }
    try {
      await withdrawFromCourse(userId, courseId);
      alert('Successfully withdrawn from the course');
      navigate(`/courses/${courseId}`);
    } catch (e) {
      console.error('Failed to withdraw:', e);
      alert('Failed to withdraw from course: ' + (e.response?.data?.message || e.message));
    }
  }

  async function handleSubmitRating() {
    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (userHasReviewed) {
      alert('You have already reviewed this course. Each user can only submit one review per course.');
      return;
    }
    
    setSubmittingRating(true);
    
    try {
      await submitCourseReview(courseId, {
        student_id: Number(userId),
        rating: selectedRating,
        comment: ratingComment
      });
      
      console.log('Review submitted successfully');
      
      // Mark user as having reviewed
      setUserHasReviewed(true);
      
      // Reload reviews
      const reviewsData = await getCourseReviews(courseId);
      setReviews(reviewsData || []);
      
      // Show success message
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      
      // Close dialog and reset form
      setShowRatingDialog(false);
      setSelectedRating(0);
      setRatingComment('');
      setSubmittingRating(false);
    } catch (e) {
      console.error('Failed to submit rating:', e);
      alert('Failed to submit review. Please try again.');
      setSubmittingRating(false);
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      background: '#f5f5f5',
      padding: '24px 32px'
    }}>
      {/* Rating Dialog */}
      {showRatingDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px' }}>Rate this Course</h2>
            
            {/* Star Rating */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666' }}>Your Rating:</div>
              <div data-cy="review-stars" style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '36px',
                      cursor: 'pointer',
                      color: star <= selectedRating ? '#ffc107' : '#ddd',
                      padding: 0
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666' }}>Comment (optional):</div>
              <textarea
                data-cy="review-input"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your thoughts about this course..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRatingDialog(false);
                  setSelectedRating(0);
                  setRatingComment('');
                }}
                disabled={submittingRating}
                style={{
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: submittingRating ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                data-cy="review-submit-button"
                onClick={handleSubmitRating}
                disabled={submittingRating || selectedRating === 0}
                style={{
                  background: (submittingRating || selectedRating === 0) ? '#ccc' : '#2ea67a',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (submittingRating || selectedRating === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Course Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Course Image */}
            <div style={{
              width: 200,
              height: 200,
              background: '#f0f0f0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              border: '2px solid #e0e0e0'
            }}>
              {course.course_image ? (
                <img src={course.course_image} alt={course.course_title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              ) : (
                <div style={{fontSize: 72, fontWeight: 'bold', color: '#999'}}>
                  {course.course_title?.slice(0,2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Course Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                margin: '0 0 16px 0',
                fontSize: '32px',
                fontWeight: 600,
                color: '#222'
              }}>
                {course.course_title} <span style={{ color: '#999', fontSize: '24px' }}>Part I</span>
              </h1>
              
              {/* Course Score */}
              {courseScore && isEnrolled && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: '#e8f5f0',
                  borderRadius: 12,
                  border: '2px solid #2ea67a',
                  display: 'inline-block'
                }}>
                  <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, color: '#16664d', marginBottom: 4 }}>Your Total Score</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: '#2ea67a' }}>{courseScore.totalScore} pts</div>
                    </div>
                    <div style={{ borderLeft: '2px solid #2ea67a', paddingLeft: 24 }}>
                      <div style={{ fontSize: 14, color: '#16664d', marginBottom: 4 }}>Quiz Attempts</div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#2ea67a' }}>{courseScore.quizAttempts}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lessons List - Only show if enrolled */}
          {isEnrolled && (
          <div style={{ marginBottom: '24px' }}>
            {lessons.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No lessons available for this course yet.
              </div>
            )}
            {lessons.map((lesson, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                background: 'white'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', color: '#333', fontWeight: 600, marginBottom: '4px' }}>
                    {lesson.lesson_title}
                  </div>
                  {lesson.lesson_description && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {lesson.lesson_description}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => alert(`Navigate to lesson: ${lesson.lesson_title}\n(To be implemented)`)}
                  style={{
                    background: '#2ea67a',
                    color: 'white',
                    border: 'none',
                    padding: '8px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginLeft: '16px'
                  }}
                >
                  Open Lesson
                </button>
              </div>
            ))}
          </div>
          )}

          {/* Quizzes List - Only show if enrolled */}
          {isEnrolled && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#222' }}>
              📝 Quizzes
            </h3>
            {quizzes.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No quizzes available for this course yet.
              </div>
            )}
            {quizzes.map((quiz, index) => {
              const quizId = quiz.quiz_id || quiz.id;
              const isCompleted = completedQuizzes.has(quizId);
              
              return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #e8f0fe',
                borderRadius: '8px',
                background: '#f8fbff'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', color: '#333', fontWeight: 600, marginBottom: '4px' }}>
                    {quiz.quiz_title || quiz.title}
                  </div>
                  {(quiz.quiz_description || quiz.description) && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {quiz.quiz_description || quiz.description}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => !isCompleted && navigate(`/users/${userId}/courses/${courseId}/quizzes/${quizId}`)}
                  disabled={isCompleted}
                  style={{
                    background: isCompleted ? '#ccc' : '#4285f4',
                    color: 'white',
                    border: 'none',
                    padding: '8px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isCompleted ? 'not-allowed' : 'pointer',
                    marginLeft: '16px'
                  }}
                >
                  {isCompleted ? 'Already Taken' : 'Take Quiz'}
                </button>
              </div>
              );
            })}
          </div>
          )}

          {/* Action Buttons Row */}
          {!isEnrolled && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                style={{
                  background: enrolling ? '#ccc' : '#2ea67a',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: enrolling ? 'not-allowed' : 'pointer'
                }}
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            </div>
          </div>
          )}

          {/* Bottom Action Buttons - Only show if enrolled */}
          {isEnrolled && (
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #e0e0e0',
            justifyContent: 'space-between'
          }}>
            <button
              data-cy="rate-button"
              onClick={() => setShowRatingDialog(true)}
              disabled={userHasReviewed}
              style={{
                background: userHasReviewed ? '#ccc' : '#2ea67a',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: userHasReviewed ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: userHasReviewed ? 0.6 : 1
              }}
              title={userHasReviewed ? 'You have already reviewed this course' : 'Rate this course'}
            >
              <span>⭐</span>
              {userHasReviewed ? 'Already Reviewed' : 'Rate'}
            </button>
            
            <button
              onClick={handleWithdraw}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Withdraw
            </button>
          </div>
          )}

          {/* Review Success Message */}
          {reviewSuccess && (
            <div data-cy="review-success" style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#d4edda', 
              color: '#155724', 
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500
            }}>
              Review submitted successfully!
            </div>
          )}

          {/* Review List - placeholder για testing */}
          <div data-cy="review-list" style={{ marginTop: 16, display: 'none' }}>
            {/* Reviews would be listed here */}
          </div>
        </div>
      </div>
    </div>
  );
}
