import client from './client';

// Extract data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

/**
 * GET /courses/:courseId/lessons
 * Public (students + teachers)
 */
export const getCourseLessons = async (courseId) => {
  try {
    const r = await client.get(`/courses/${courseId}/lessons`);
    const data = unwrap(r);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Get course lessons error:', err);
    return [];
  }
};

/**
 * GET /courses/:courseId/lessons/:lessonTitle
 * Public
 */
export const getLesson = async (courseId, lessonTitle) => {
  try {
    const encodedTitle = encodeURIComponent(lessonTitle);
    const r = await client.get(`/courses/${courseId}/lessons/${encodedTitle}`);
    return unwrap(r);
  } catch (err) {
    console.error('Get lesson error:', err);
    return null;
  }
};

/**
 * POST /courses/:courseId/lessons
 * Teacher only (JWT required)
 */
export const createLesson = async (courseId, payload) => {
  try {
    const r = await client.post(`/courses/${courseId}/lessons`, payload);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status,
      error: err?.response?.data
    };
  }
};

/**
 * PUT /courses/:courseId/lessons/:lessonTitle
 * Teacher only (owner)
 */
export const updateLesson = async (courseId, lessonTitle, payload) => {
  try {
    const encodedTitle = encodeURIComponent(lessonTitle);
    const r = await client.put(
      `/courses/${courseId}/lessons/${encodedTitle}`,
      payload
    );
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status,
      error: err?.response?.data
    };
  }
};

/**
 * DELETE /courses/:courseId/lessons/:lessonTitle
 * Teacher only (owner)
 */
export const deleteLesson = async (courseId, lessonTitle) => {
  try {
    const encodedTitle = encodeURIComponent(lessonTitle);
    await client.delete(`/courses/${courseId}/lessons/${encodedTitle}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status,
      error: err?.response?.data
    };
  }
};
