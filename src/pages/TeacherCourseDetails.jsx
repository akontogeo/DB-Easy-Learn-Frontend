import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse } from '../api/courses';
import { getCourseLessons, createLesson, updateLesson, deleteLesson } from '../api/lessons';
import { getCourseQuizzes, createQuiz, updateQuiz, deleteQuiz, getQuizForTeacher } from '../api/quizzes';
import { getCourseReviews, getCourseAverageRating } from '../api/courses';
import { useAuth } from '../context/AuthContext';

export default function TeacherCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  // QUIZZES STATE
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizError, setQuizError] = useState('');
  const emptyQuizForm = {
    quiz_title: '',
    questions: [
      { question_text: '', question_points: 1, answers: [
        { answer_text: '', is_correct: true },
        { answer_text: '', is_correct: false }
      ]}
    ]
  };
  const [quizForm, setQuizForm] = useState(emptyQuizForm);
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
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadQuizzes = async () => {
    setQuizLoading(true);
    const res = await getCourseQuizzes(courseId);
    if (res.ok) {
      setQuizzes(Array.isArray(res.data) ? res.data : []);
      setQuizError('');
    } else {
      setQuizzes([]);
      setQuizError(res.error?.message || 'Failed to load quizzes');
      console.error('Failed to load quizzes:', res.error);
    }
    setQuizLoading(false);
  };

  const openCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm(emptyQuizForm);
    setQuizError('');
    setShowQuizModal(true);
  };

  const openEditQuiz = async (quiz) => {
    // load full quiz WITH correct answers for editing
    const res = await getQuizForTeacher(courseId, quiz.quiz_id);
    if (!res.ok) {
      alert(res.error?.message || 'Failed to load quiz for edit');
      return;
    }
    setEditingQuiz(quiz);
    setQuizForm({
      quiz_title: res.data.quiz_title || '',
      questions: (res.data.questions || []).map(q => ({
        question_text: q.question_text || '',
        question_points: typeof q.question_points === 'number' ? q.question_points : 1,
        answers: (q.answers || []).map(a => ({
          answer_text: a.answer_text || '',
          is_correct: !!a.is_correct
        }))
      }))
    });
    setQuizError('');
    setShowQuizModal(true);
  };

  const saveQuiz = async (e) => {
    e.preventDefault();
    setQuizError('');

    // basic validation
    if (!quizForm.quiz_title.trim()) {
      setQuizError('Quiz title is required');
      return;
    }
    if (!quizForm.questions?.length) {
      setQuizError('At least 1 question is required');
      return;
    }
    for (const q of quizForm.questions) {
      if (!q.question_text?.trim()) return setQuizError('All questions must have text');
      if (!q.answers?.length || q.answers.length < 2) return setQuizError('Each question needs at least 2 answers');
      const hasCorrect = q.answers.some(a => a.is_correct);
      if (!hasCorrect) return setQuizError('Each question must have 1 correct answer');
      for (const a of q.answers) {
        if (!a.answer_text?.trim()) return setQuizError('All answers must have text');
      }
    }

    // Add question_number to each question
    // Ensure question_number is always set for each question
    const quizPayload = {
      ...quizForm,
      questions: (quizForm.questions || []).map((q, idx) => {
        const { question_text, question_points, answers } = q;
        return {
          question_text,
          question_points,
          question_number: idx + 1,
          answers: (answers || []).map((a, ai) => ({
            ...a,
            question_number: idx + 1,
            answer_number: ai + 1
          }))
        };
      })
    };
    console.log('Quiz payload being sent:', JSON.stringify(quizPayload, null, 2));
    const res = editingQuiz
      ? await updateQuiz(courseId, editingQuiz.quiz_id, quizPayload)
      : await createQuiz(courseId, quizPayload);

    if (!res.ok) {
      setQuizError(res.error?.message || 'Failed to save quiz');
      return;
    }

    setShowQuizModal(false);
    await loadQuizzes();
  };

  const removeQuizUI = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    const res = await deleteQuiz(courseId, quizId);
    if (!res.ok) {
      alert(res.error?.message || 'Failed to delete quiz');
      return;
    }
    await loadQuizzes();
  };

  // helpers for form editing
  const setQuestionText = (qi, value) => {
    setQuizForm(prev => {
      const next = structuredClone(prev);
      next.questions[qi].question_text = value;
      return next;
    });
  };

  const setQuestionPoints = (qi, value) => {
    setQuizForm(prev => {
      const next = structuredClone(prev);
      next.questions[qi].question_points = Number(value) || 1;
      return next;
    });
  };

  const setAnswerText = (qi, ai, value) => {
    setQuizForm(prev => {
      const next = structuredClone(prev);
      next.questions[qi].answers[ai].answer_text = value;
      return next;
    });
  };

  const setCorrectAnswer = (qi, ai) => {
    setQuizForm(prev => {
      const next = structuredClone(prev);
      next.questions[qi].answers = next.questions[qi].answers.map((a, idx) => ({
        ...a,
        is_correct: idx === ai
      }));
      return next;
    });
  };

  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          question_points: 1,
          answers: [
            { answer_text: '', is_correct: true },
            { answer_text: '', is_correct: false }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (qi) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qi)
    }));
  };

  const addAnswer = (qi) => {
    setQuizForm(prev => {
      const next = structuredClone(prev);
      next.questions[qi].answers.push({ answer_text: '', is_correct: false });
      return next;
    });
  };

  const removeAnswer = (qi, ai) => {
    setQuizForm(prev => {
      const next = structuredClone(prev);
      next.questions[qi].answers.splice(ai, 1);
      // ensure at least one correct
      if (!next.questions[qi].answers.some(a => a.is_correct) && next.questions[qi].answers[0]) {
        next.questions[qi].answers[0].is_correct = true;
      }
      return next;
    });
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Quizzes ({quizzes.length})</h2>
          <button
            onClick={openCreateQuiz}
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
            + Add Quiz
          </button>
        </div>
        {quizLoading ? (
          <div style={{ padding: 40, background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#666' }}>Loading quizzes...</p>
          </div>
        ) : (Array.isArray(quizzes) ? quizzes : []).length === 0 ? (
          <div style={{ padding: 40, background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#666' }}>No quizzes yet. Create your first quiz!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(Array.isArray(quizzes) ? quizzes : []).map((quiz) => (
              <div key={quiz.quiz_id} style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{quiz.quiz_title}</h3>
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                  <button
                    onClick={() => openEditQuiz(quiz)}
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
                    onClick={() => removeQuizUI(quiz.quiz_id)}
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

      {/* Quiz Modal */}
      {showQuizModal && (
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
            maxWidth: 700,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
            {quizError && (
              <div style={{ padding: 12, background: '#fee', color: '#c00', borderRadius: 6, marginBottom: 16 }}>
                {quizError}
              </div>
            )}
            <form onSubmit={saveQuiz}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizForm.quiz_title}
                  onChange={e => setQuizForm({ ...quizForm, quiz_title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>
              {quizForm.questions.map((q, qi) => (
                <div key={qi} style={{ marginBottom: 24, border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontWeight: 'bold' }}>Question {qi + 1}</label>
                    {quizForm.questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={q.question_text}
                    onChange={e => setQuestionText(qi, e.target.value)}
                    placeholder="Enter question text"
                    style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, marginBottom: 8 }}
                  />
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontWeight: 'bold', marginRight: 8 }}>Points *</label>
                    <input
                      type="number"
                      min={1}
                      value={q.question_points || 1}
                      onChange={e => setQuestionPoints(qi, e.target.value)}
                      style={{ width: 80, padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}
                    />
                  </div>
                  <div style={{ marginLeft: 12 }}>
                    {q.answers.map((a, ai) => (
                      <div key={ai} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <input
                          type="text"
                          value={a.answer_text}
                          onChange={e => setAnswerText(qi, ai, e.target.value)}
                          placeholder={`Answer ${ai + 1}`}
                          style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: 13, marginRight: 8 }}
                        />
                        <label style={{ marginRight: 8 }}>
                          <input
                            type="radio"
                            checked={a.is_correct}
                            onChange={() => setCorrectAnswer(qi, ai)}
                          /> Correct
                        </label>
                        {q.answers.length > 2 && (
                          <button type="button" onClick={() => removeAnswer(qi, ai)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addAnswer(qi)} style={{ color: '#2ea67a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>+ Add Answer</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addQuestion} style={{ color: '#2ea67a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginBottom: 16 }}>+ Add Question</button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
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
                  {editingQuiz ? 'Save Changes' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
