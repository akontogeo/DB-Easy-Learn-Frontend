import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// Course reviews page - display all user reviews and ratings
import { getCourse, getCourseReviews } from '../api/courses';

export default function CourseReviews() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [courseData, reviewsData] = await Promise.all([
          getCourse(courseId),
          getCourseReviews(courseId)
        ]);
        setCourse(courseData);
        setReviews(reviewsData);
      } catch (e) {
        console.error('Failed to load reviews:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  if (!course) {
    return <div className="card">Course not found</div>;
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || r.stars || 0), 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      background: '#f5f5f5',
      padding: '24px 32px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link to={`/courses/${courseId}`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#2ea67a',
          textDecoration: 'none',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ← Back to Course
        </Link>

        {/* Course Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#222' }}>
            {course.course_title}
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '16px',
            color: '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#ffc107', fontSize: '20px' }}>★</span>
              <span style={{ fontWeight: 600, color: '#333' }}>{avgRating}</span>
              <span>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#222' }}>
            Course Reviews
          </h2>

          {reviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p style={{ margin: 0, fontSize: '16px' }}>No reviews yet</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Be the first to review this course!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((review, index) => (
                <div key={review.ratingId || index} style={{
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: '#fafafa'
                }}>
                  {/* Review Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#2ea67a',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '16px'
                      }}>
                        U{review.userId}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>
                          User {review.userId}
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '2px',
                          marginTop: '4px'
                        }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} style={{
                              color: star <= (review.rating || review.stars || 0) ? '#ffc107' : '#ddd',
                              fontSize: '16px'
                            }}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <div style={{
                      fontSize: '14px',
                      color: '#555',
                      lineHeight: '1.5',
                      paddingLeft: '52px'
                    }}>
                      {review.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
