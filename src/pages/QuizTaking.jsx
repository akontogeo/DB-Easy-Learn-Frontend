import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../api/quizzes';

export default function QuizTaking() {
  const { userId, courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      
      // Check if quiz is already completed
      const completedKey = `completed_quizzes_user_${userId}_course_${courseId}`;
      const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
      if (completed.includes(Number(quizId))) {
        // Redirect back to course if already completed
        navigate(`/users/${userId}/courses/${courseId}`);
        return;
      }
      
      const quizData = await getQuiz(courseId, quizId);
      setQuiz(quizData);
      
      // Initialize answers object using question_number as key
      if (quizData?.questions) {
        const initialAnswers = {};
        quizData.questions.forEach(q => {
          initialAnswers[q.question_number] = null;
        });
        setAnswers(initialAnswers);
      }
    } catch (e) {
      console.error('Failed to load quiz:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [courseId, quizId]);

  const handleAnswerChange = (questionNumber, answerNumber) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answerNumber
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = Object.values(answers).some(a => a === null);
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

      const resultData = await submitQuiz(courseId, quizId, {
        userId: Number(userId),
        answers: answersArray
      });

      // Save completed quiz to localStorage
      const completedKey = `completed_quizzes_user_${userId}_course_${courseId}`;
      const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
      if (!completed.includes(Number(quizId))) {
        completed.push(Number(quizId));
        localStorage.setItem(completedKey, JSON.stringify(completed));
      }

      setResult(resultData);
    } catch (e) {
      console.error('Failed to submit quiz:', e);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="card">Quiz not found</div>;
  }

  // Show result screen after submission
  if (result) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>
            {result.percentage >= 70 ? '🎉' : '📚'}
          </div>
          
          <h1 style={{ marginTop: 0, marginBottom: 16, fontSize: 32, fontWeight: 600 }}>
            {result.percentage >= 70 ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          
          <div style={{ fontSize: 48, fontWeight: 700, color: result.percentage >= 70 ? '#2ea67a' : '#ff6b6b', marginBottom: 20 }}>
            {result.percentage}%
          </div>
          
          <p style={{ fontSize: 18, color: '#666', marginBottom: 30 }}>
            You scored {result.score} out of {result.totalPoints} points.
          </p>

          {result.percentage >= 70 && (
            <div style={{ 
              padding: 16, 
              background: '#e8f5f0', 
              borderRadius: 8, 
              marginBottom: 30,
              color: '#2ea67a',
              fontWeight: 600
            }}>
              ✓ You passed!
            </div>
          )}

          {result.percentage < 70 && (
            <div style={{ 
              padding: 16, 
              background: '#ffe8e8', 
              borderRadius: 8, 
              marginBottom: 30,
              color: '#ff6b6b',
              fontWeight: 600
            }}>
              Keep practicing!
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/users/${userId}/courses/${courseId}`)}
              className="btn"
              style={{
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              Back to Course
            </button>
          </div>
        </div>
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

        {/* Questions */}
        <div style={{ marginBottom: 32 }}>
          {quiz.questions && quiz.questions.map((question, qIndex) => {
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
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  marginBottom: 16,
                  color: '#222'
                }}>
                  Question {questionNumber}: {question.question_text}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {question.answers && question.answers.map((answer) => {
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
                        />
                        <span style={{ fontSize: 16, color: '#333' }}>
                          {answer.answer_text}
                        </span>
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
            disabled={submitting}
            style={{
              padding: '16px 48px',
              fontSize: 18,
              fontWeight: 600,
              background: submitting ? '#ccc' : '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
