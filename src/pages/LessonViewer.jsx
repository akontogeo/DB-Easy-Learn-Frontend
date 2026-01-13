import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLesson } from '../api/lessons';
import { getCourse } from '../api/courses';
import { useAuth } from '../context/AuthContext';

export default function LessonViewer() {
  const { userId, courseId, lessonTitle } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        setError('');

        // Load course info
        const courseData = await getCourse(courseId);
        setCourse(courseData);

        // Load lesson content
        const lessonData = await getLesson(courseId, lessonTitle);
        
        if (!lessonData) {
          setError('Lesson not found');
          return;
        }

        setLesson(lessonData);
      } catch (err) {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson content');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [courseId, lessonTitle]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="card">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="card">
          <p style={{ color: '#dc3545', marginBottom: 20 }}>{error || 'Lesson not found'}</p>
          <button
            onClick={() => navigate(`/users/${userId}/courses/${courseId}`)}
            style={{
              padding: '10px 20px',
              background: '#2ea67a',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 40 }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            {course?.course_title}
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, color: '#222' }}>
            {lesson.lesson_title}
          </h1>
        </div>
        <button
          onClick={() => navigate(`/users/${userId}/courses/${courseId}`)}
          style={{
            padding: '10px 20px',
            background: '#f0f0f0',
            color: '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          ← Back to Course
        </button>
      </div>

      {/* Lesson Description */}
      {lesson.lesson_description && (
        <div style={{
          background: '#e8f5f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          border: '2px solid #2ea67a'
        }}>
          <p style={{ margin: 0, fontSize: 16, color: '#16664d' }}>
            {lesson.lesson_description}
          </p>
        </div>
      )}

      {/* Video Content */}
      {lesson.video_url && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: 24
        }}>
          <h3 style={{ marginBottom: 16, fontSize: 20, color: '#222' }}>
            🎥 Video Lesson
          </h3>
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0,
            overflow: 'hidden',
            borderRadius: 8
          }}>
            <iframe
              src={lesson.video_url.replace('watch?v=', 'embed/')}
              title={lesson.lesson_title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: 8
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Additional Materials */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 32,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ marginBottom: 16, fontSize: 20, color: '#222' }}>
          📎 Additional Materials
        </h3>
        {(lesson.attachment_url || lesson.summary_sheet) ? (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {lesson.attachment_url && (
              <a
                href={lesson.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#4a90e2',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                📄 Download Attachment
              </a>
            )}
            {lesson.summary_sheet && (
              <a
                href={lesson.summary_sheet}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#2ea67a',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                📋 Summary Sheet
              </a>
            )}
          </div>
        ) : (
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: 8,
            textAlign: 'center',
            color: '#666',
            fontSize: 14
          }}>
            No additional materials available for this lesson.
          </div>
        )}
      </div>
    </div>
  );
}
