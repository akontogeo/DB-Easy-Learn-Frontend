import client from './client';

// Extract course data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// Filter courses by keyword and category
const filterCourses = (courses, params = {}) => {
  params = params || {};

  let results = Array.isArray(courses) ? courses.slice() : [];

  // Search by keyword in title or description (case-insensitive)
  if (params.keyword || params.q) {
    const searchTerm = (params.keyword || params.q || '')
      .toString()
      .trim()
      .toLowerCase();

    if (searchTerm) {
      results = results.filter((course) => {
        const titleMatch = (course.course_title || '')
          .toLowerCase()
          .includes(searchTerm);
        const descMatch = (course.course_description || '')
          .toLowerCase()
          .includes(searchTerm);
        return titleMatch || descMatch;
      });
    }
  }

  // Filter by category_id
  if (params.category) {
    const categoryFilter = Number(params.category);
    results = results.filter((c) => c.category_id === categoryFilter);
  }

  return results;
};

// Helper: normalize axios error into a predictable object
const wrapError = (err) => {
  if (err?.response) {
    return {
      ok: false,
      status: err.response.status,
      error: err.response.data
    };
  }
  return {
    ok: false,
    status: 0,
    error: {
      success: false,
      error: 'Network Error',
      message: err?.message || 'Request failed'
    }
  };
};

// GET /courses - Fetch from backend and apply client-side filtering
export const searchCourses = (params) => {
  return client
    .get('/courses')
    .then((r) => {
      const data = unwrap(r);
      const courses = Array.isArray(data) ? data : [];
      // Apply client-side filtering with params
      return filterCourses(courses, params);
    })
    .catch((err) => {
      console.error('Search courses error:', err);
      return [];
    });
};

// GET /courses/{courseId}
export const getCourse = (courseId) => {
  return client
    .get(`/courses/${courseId}`)
    .then((r) => unwrap(r))
    .catch((err) => {
      console.error('Get course error:', err);
      return null;
    });
};

// GET /courses/{courseId}/reviews
export const getCourseReviews = (courseId) => {
  return client
    .get(`/courses/${courseId}/reviews`)
    .then((r) => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch((err) => {
      console.error('Get ratings error:', err);
      return [];
    });
};

// GET /courses/{courseId}/reviews/average
export const getCourseAverageRating = (courseId) => {
  return client
    .get(`/courses/${courseId}/reviews/average`)
    .then((r) => unwrap(r))
    .catch((err) => {
      console.error('Get average rating error:', err);
      return { averageRating: 'N/A', totalReviews: 0 };
    });
};

// POST /courses/{courseId}/reviews
export const submitCourseReview = (courseId, payload) => {
  return client
    .post(`/courses/${courseId}/reviews`, payload)
    .then((r) => unwrap(r));
};

/**
 * POST /courses - Create new course (Teacher only)
 * Returns:
 *  - success: { ok: true, data: <created course> }
 *  - error:   { ok: false, status: <http status>, error: <backend json> }
 */
export const createCourse = async (payload) => {
  try {
    // IMPORTANT: backend must NOT require teacher_id from frontend anymore
    const r = await client.post('/courses', payload);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};

/**
 * PUT /courses/:courseId - Update course (Teacher only)
 * Returns:
 *  - success: { ok: true, data: <updated course> }
 *  - error:   { ok: false, status, error }
 */
export const updateCourse = async (courseId, payload) => {
  try {
    const r = await client.put(`/courses/${courseId}`, payload);
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};

/**
 * DELETE /courses/:courseId - Delete course (Teacher only)
 * NOTE: axios delete with body uses { data: payload }
 * Returns:
 *  - success: { ok: true, data: <whatever backend returns> }
 *  - error:   { ok: false, status, error }
 */
export const deleteCourse = async (courseId, payload) => {
  try {
    const r = await client.delete(`/courses/${courseId}`, { data: payload });
    return { ok: true, data: unwrap(r) };
  } catch (err) {
    return wrapError(err);
  }
};
