import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse } from '../api/courses';
import { getCourseLessons, createLesson, updateLesson, deleteLesson } from '../api/lessons';
import { getCourseQuizzes } from '../api/quizzes';
import { getCourseReviews, getCourseAverageRating } from '../api/courses';
import { useAuth } from '../context/AuthContext';

export default function TeacherCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({
    lesson_title: '',
    lesson_description: '',
    video_url: '',
    attachment_url: '',
    summary_sheet: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    setLoading(true);
    const [courseData, lessonsData, quizzesData, reviewsData, ratingData] = await Promise.all([
      getCourse(courseId),
      getCourseLessons(courseId),
      getCourseQuizzes(courseId),
      getCourseReviews(courseId),
      getCourseAverageRating(courseId)
    ]);
    
    setCourse(courseData);
    setLessons(lessonsData);
    setQuizzes(quizzesData);
    setReviews(reviewsData);
    setAverageRating(ratingData);
    setLoading(false);
  };

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setLessonFormData({
      lesson_title: '',
      lesson_description: '',
      video_url: '',
      attachment_url: '',
      summary_sheet: ''
    });
    setError('');
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      lesson_title: lesson.lesson_title,
      lesson_description: lesson.lesson_description,
      video_url: lesson.video_url || '',
      attachment_url: lesson.attachment_url || '',
      summary_sheet: lesson.summary_sheet || ''
    });
    setError('');
    setShowLessonModal(true);
  };

  const handleDeleteLesson = async (lessonTitle) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await deleteLesson(courseId, lessonTitle);
      await loadCourseData();
    } catch (err) {
      alert('Failed to delete lesson: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!lessonFormData.lesson_title || !lessonFormData.lesson_description) {
      setError('Please fill in title and description');
      return;
    }

    try {
      const payload = {
        lesson_title: lessonFormData.lesson_title,
        lesson_description: lessonFormData.lesson_description,
        video_url: lessonFormData.video_url,
        attachment_url: lessonFormData.attachment_url,
        summary_sheet: lessonFormData.summary_sheet
      };

      if (editingLesson) {
        await updateLesson(courseId, editingLesson.lesson_title, payload);
      } else {
        await createLesson(courseId, payload);
      }

      setShowLessonModal(false);
      await loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save lesson');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Loading course data...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Course not found</p>
        <button onClick={() => navigate('/teacher/courses')}>Back to Courses</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <button
        onClick={() => navigate('/teacher/courses')}
        style={{
          padding: '8px 16px',
          background: '#f0f0f0',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          marginBottom: 20,
          fontSize: 14
        }}
      >
        ← Back to Courses
      </button>

      <div style={{ marginBottom: 30 }}>
        <h1 style={{ margin: '0 0 12px 0' }}>{course.course_title}</h1>
        <p style={{ color: '#666', margin: 0 }}>{course.course_description}</p>
        {averageRating && (
          <div style={{ marginTop: 12, fontSize: 14, color: '#2ea67a', fontWeight: 'bold' }}>
            ⭐ {averageRating.averageRating} ({averageRating.totalReviews} reviews)
          </div>
        )}
      </div>

      {/* Lessons Section */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Lessons ({lessons.length})</h2>
          <button
            onClick={handleCreateLesson}
            style={{
              padding: '10px 20px',
              background: '#2ea67a',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div style={{ padding: 40, background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#666' }}>No lessons yet. Create your first lesson!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lessons.map((lesson, index) => (
              <div key={index} style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{lesson.lesson_title}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{lesson.lesson_description}</p>
                  {lesson.video_url && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                      📹 Video available
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                  <button
                    onClick={() => handleEditLesson(lesson)}
                    style={{
                      padding: '8px 16px',
                      background: 'white',
                      color: '#2ea67a',
                      border: '2px solid #2ea67a',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.lesson_title)}
                    style={{
                      padding: '8px 16px',
                      background: 'white',
                      color: '#dc3545',
                      border: '2px solid #dc3545',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes Section */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Quizzes ({quizzes.length})</h2>
        {quizzes.length === 0 ? (
          <div style={{ padding: 40, background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#666' }}>No quizzes yet.</p>
            <p style={{ color: '#999', fontSize: 14 }}>Quiz management coming soon</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quizzes.map((quiz) => (
              <div key={quiz.quiz_id} style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16
              }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{quiz.quiz_title}</h3>
                <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: 13 }}>
                  Quiz management coming soon
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 style={{ marginBottom: 20 }}>Student Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div style={{ padding: 40, background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#666' }}>No reviews yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((review, index) => (
              <div key={index} style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 'bold' }}>Student #{review.student_id}</span>
                  <span style={{ color: '#2ea67a', fontWeight: 'bold' }}>⭐ {review.rating}</span>
                </div>
                {review.comment && (
                  <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{review.comment}</p>
                )}
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  {new Date(review.review_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
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
            borderRadius: 12,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
            
            {error && (
              <div style={{ padding: 12, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLessonSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={lessonFormData.lesson_title}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, lesson_title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                  required
                  disabled={!!editingLesson}
                />
                {editingLesson && (
                  <small style={{ color: '#999' }}>Title cannot be changed</small>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Description *
                </label>
                <textarea
                  value={lessonFormData.lesson_description}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, lesson_description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14,
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Video URL
                </label>
                <input
                  type="url"
                  value={lessonFormData.video_url}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, video_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Attachment URL
                </label>
                <input
                  type="url"
                  value={lessonFormData.attachment_url}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, attachment_url: e.target.value })}
                  placeholder="https://example.com/slides.pdf"
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Summary Sheet URL
                </label>
                <input
                  type="url"
                  value={lessonFormData.summary_sheet}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, summary_sheet: e.target.value })}
                  placeholder="https://example.com/summary.pdf"
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#2ea67a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {editingLesson ? 'Save Changes' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
