import client from './client';

// Extract data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// GET /courses/:courseId/lessons - List all lessons for a course
export const getCourseLessons = (courseId) => {
  return client.get(`/courses/${courseId}/lessons`)
    .then(r => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch(err => {
      console.error('Get course lessons error:', err);
      return [];
    });
};

// GET /courses/:courseId/lessons/:lessonTitle - Get specific lesson (URL encode lessonTitle)
export const getLesson = (courseId, lessonTitle) => {
  const encodedTitle = encodeURIComponent(lessonTitle);
  return client.get(`/courses/${courseId}/lessons/${encodedTitle}`)
    .then(r => unwrap(r))
    .catch(err => {
      console.error('Get lesson error:', err);
      return null;
    });
};

// POST /courses/:courseId/lessons - Create new lesson (Admin only)
export const createLesson = (courseId, payload, authCredentials) => {
  const config = {};
  if (authCredentials) {
    const auth = btoa(`${authCredentials.username}:${authCredentials.password}`);
    config.headers = { Authorization: `Basic ${auth}` };
  }
  
  return client.post(`/courses/${courseId}/lessons`, payload, config).then(r => unwrap(r));
};

// PUT /courses/:courseId/lessons/:lessonTitle - Update lesson (Admin only)
export const updateLesson = (courseId, lessonTitle, payload, authCredentials) => {
  const encodedTitle = encodeURIComponent(lessonTitle);
  const config = {};
  if (authCredentials) {
    const auth = btoa(`${authCredentials.username}:${authCredentials.password}`);
    config.headers = { Authorization: `Basic ${auth}` };
  }
  
  return client.put(`/courses/${courseId}/lessons/${encodedTitle}`, payload, config).then(r => unwrap(r));
};

// DELETE /courses/:courseId/lessons/:lessonTitle - Delete lesson (Admin only)
export const deleteLesson = (courseId, lessonTitle, authCredentials) => {
  const encodedTitle = encodeURIComponent(lessonTitle);
  const config = {};
  if (authCredentials) {
    const auth = btoa(`${authCredentials.username}:${authCredentials.password}`);
    config.headers = { Authorization: `Basic ${auth}` };
  }
  
  return client.delete(`/courses/${courseId}/lessons/${encodedTitle}`, config);
};
