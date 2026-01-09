import client from './client';

// Extract data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// GET /courses/:courseId/quizzes - List all quizzes for a course
export const getCourseQuizzes = (courseId) => {
  return client.get(`/courses/${courseId}/quizzes`)
    .then(r => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch(err => {
      console.error('Get course quizzes error:', err);
      return [];
    });
};

// GET /courses/:courseId/quizzes/:quizId - Get quiz with questions (correct answers hidden)
export const getQuiz = (courseId, quizId) => {
  return client.get(`/courses/${courseId}/quizzes/${quizId}`)
    .then(r => unwrap(r))
    .catch(err => {
      console.error('Get quiz error:', err);
      return null;
    });
};

// POST /courses/:courseId/quizzes/:quizId/submit - Submit quiz answers
export const submitQuiz = (courseId, quizId, payload) => {
  return client.post(`/courses/${courseId}/quizzes/${quizId}/submit`, payload)
    .then(r => unwrap(r))
    .catch(err => {
      console.error('Submit quiz error:', err);
      throw err;
    });
};
