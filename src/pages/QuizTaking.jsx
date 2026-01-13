import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../api/quizzes';
import { useAuth } from '../context/AuthContext';

export default function QuizTaking() {
  const { userId: userIdParam, courseId, quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use logged-in user if available, else fallback to param
  const student_id = user?.userId || Number(userIdParam);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // answers: { [question_number]: answer_number | null }
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  

  const loadQuiz = async () => {
    try {
      setLoading(true);

      // Check if quiz is already completed
      const completedKey = `completed_quizzes_user_${userIdParam}_course_${courseId}`;
      const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
      if (completed.includes(Number(quizId))) {
        navigate(`/users/${userIdParam}/courses/${courseId}`);
        return;
      }

      const quizRes = await getQuiz(courseId, quizId);

      let quizData = null;
      // quizRes expected: { ok: true, data: { ...quiz } }
      if (quizRes?.ok && quizRes.data) {
        // some older code paths might wrap it
        if (quizRes.data.quiz) quizData = quizRes.data.quiz;
        else quizData = quizRes.data;
      }

      setQuiz(quizData);

      // Initialize answers
      if (quizData?.questions && Array.isArray(quizData.questions)) {
        const initialAnswers = {};
        quizData.questions.forEach((q) => {
          initialAnswers[q.question_number] = null;
        });
        setAnswers(initialAnswers);
      } else {
        setAnswers({});
      }
    } catch (e) {
      console.error('Failed to load quiz:', e);
      setQuiz(null);
      setAnswers({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line
  }, [courseId, quizId]);

  const handleAnswerChange = (questionNumber, answerNumber) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: answerNumber
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = Object.values(answers).some((a) => a === null || a === undefined);
    if (unanswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      // Transform answers to backend format
      const answersArray = Object.entries(answers).map(([questionNumber, answerNumber]) => ({
        question_number: Number(questionNumber),
        answer_number: Number(answerNumber)
      }));
      const res = await submitQuiz(courseId, quizId, {
        student_id,
        answers: answersArray
      });

      // submitQuiz in your api returns { ok, data }
      if (!res?.ok) {
        alert(res?.error?.message || 'Failed to submit quiz.');
        return;
      }

      setResult(res.data);

      // Mark as completed (optional)
      const completedKey = `completed_quizzes_user_${userIdParam}_course_${courseId}`;
      const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
      const next = Array.from(new Set([...completed, Number(quizId)]));
      localStorage.setItem(completedKey, JSON.stringify(next));

      // If you want auto-redirect after submit, uncomment:
      // navigate(`/users/${userId}/courses/${courseId}`);
    } catch (e) {
      console.error(e);
      alert('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Loading quiz...</p>
      </div>
    );
  }

  // Not found / invalid quiz
  if (!quiz) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Quiz not found.</p>
        <button
          onClick={() => navigate(`/users/${userIdParam}/courses/${courseId}`)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="card" style={{ padding: 40 }}>
        {/* Quiz Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 32, fontWeight: 600 }}>
            {quiz.quiz_title || quiz.title}
          </h1>

          {(quiz.quiz_description || quiz.description) && (
            <p style={{ margin: 0, fontSize: 16, color: '#666' }}>
              {quiz.quiz_description || quiz.description}
            </p>
          )}
        </div>

        {/* Result (optional display) */}
        {result && (
          <div
            style={{
              padding: 16,
              marginBottom: 24,
              background: '#e8f5f0',
              border: '2px solid #2ea67a',
              borderRadius: 12
            }}
          >
            <strong>Submitted!</strong>
            <div style={{ marginTop: 8 }}>
              Total points: {result?.totalPoints ?? result?.total_points ?? 'N/A'}
            </div>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => navigate(`/users/${userIdParam}/courses/${courseId}`)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2ea67a',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginTop: 8
                }}
              >
                Return to Class
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        <div style={{ marginBottom: 32 }}>
          {Array.isArray(quiz.questions) &&
            quiz.questions.map((question) => {
              const questionNumber = question.question_number;
              return (
                <div
                  key={questionNumber}
                  style={{
                    marginBottom: 32,
                    padding: 24,
                    background: '#f9f9f9',
                    borderRadius: 12,
                    border: '2px solid #e0e0e0'
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 16,
                      color: '#222'
                    }}
                  >
                    Question {questionNumber}: {question.question_text}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array.isArray(question.answers) &&
                      question.answers.map((answer) => {
                        const answerNumber = answer.answer_number;
                        const isSelected = answers[questionNumber] === answerNumber;
                        return (
                          <label
                            key={answerNumber}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: 16,
                              background: isSelected ? '#e8f5f0' : 'white',
                              border: isSelected ? '2px solid #2ea67a' : '2px solid #ddd',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${questionNumber}`}
                              value={answerNumber}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(questionNumber, answerNumber)}
                              style={{ marginRight: 12, width: 20, height: 20, cursor: 'pointer' }}
                              disabled={!!result} // lock after submit (optional)
                            />
                            <span style={{ fontSize: 16, color: '#333' }}>{answer.answer_text}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || !!result}
            style={{
              padding: '16px 48px',
              fontSize: 18,
              fontWeight: 600,
              background: submitting || result ? '#ccc' : '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: submitting || result ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)'
            }}
          >
            {result ? 'Submitted' : submitting ? 'Submitting...' : 'Submit Quiz'}
            
          </button>
        </div>
      </div>
    </div>
  );
}
