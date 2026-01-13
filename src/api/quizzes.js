import client from './client';

const unwrap = (response) => response.data?.data || response.data;

const wrapError = (err) => {
  if (err?.response) return { ok: false, status: err.response.status, error: err.response.data };
  return {
    ok: false,
    status: 0,
    error: { success: false, error: 'Network Error', message: err?.message || 'Request failed' }
  };
};

export const getCourseQuizzes = async (courseId) => {
  try {
    const r = await client.get(`/courses/${courseId}/quizzes`);
    const data = unwrap(r);
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return wrapError(err);
  }
};

export const getQuiz = async (courseId, quizId) => {
  try {
    const r = await client.get(`/courses/${courseId}/quizzes/${quizId}`);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};

// ✅ teacher endpoint (includes correct answers)
export const getQuizForTeacher = async (courseId, quizId) => {
  try {
    const r = await client.get(`/courses/${courseId}/quizzes/${quizId}/teacher`);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};

export const createQuiz = async (courseId, payload) => {
  try {
    const r = await client.post(`/courses/${courseId}/quizzes`, payload);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};

export const updateQuiz = async (courseId, quizId, payload) => {
  try {
    const r = await client.put(`/courses/${courseId}/quizzes/${quizId}`, payload);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};

export const deleteQuiz = async (courseId, quizId) => {
  try {
    const r = await client.delete(`/courses/${courseId}/quizzes/${quizId}`);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};

export const submitQuiz = async (courseId, quizId, payload) => {
  try {
    const r = await client.post(`/courses/${courseId}/quizzes/${quizId}/submit`, payload);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};
