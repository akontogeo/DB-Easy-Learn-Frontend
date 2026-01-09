import client from './client';

// Extract course data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// Filter courses by keyword and category
const filterCourses = (courses, params = {}) => {
  params = params || {};
  
  let results = Array.isArray(courses) ? courses.slice() : [];
  
  // Search by keyword in title or description (case-insensitive)
  if (params.keyword || params.q) {
    const searchTerm = (params.keyword || params.q || '').toString().trim().toLowerCase();
    if (searchTerm) {
      results = results.filter(course => {
        const titleMatch = (course.course_title || '').toLowerCase().includes(searchTerm);
        const descMatch = (course.course_description || '').toLowerCase().includes(searchTerm);
        return titleMatch || descMatch;
      });
    }
  }
  
  // Filter by category_id
  if (params.category) {
    const categoryFilter = Number(params.category);
    results = results.filter(c => c.category_id === categoryFilter);
  }
  
  return results;
};

// GET /courses - Fetch from backend and apply client-side filtering
export const searchCourses = (params) => {
  return client.get('/courses')
    .then(r => {
      const data = unwrap(r);
      const courses = Array.isArray(data) ? data : [];
      // Apply client-side filtering with params
      return filterCourses(courses, params);
    })
    .catch(err => {
      console.error('Search courses error:', err);
      return [];
    });
};

// GET /courses/{courseId}
export const getCourse = (courseId) => {
  return client.get(`/courses/${courseId}`)
    .then(r => unwrap(r))
    .catch(err => {
      console.error('Get course error:', err);
      return null;
    });
};

// GET /courses/{courseId}/reviews
export const getCourseReviews = (courseId) => {
  return client.get(`/courses/${courseId}/reviews`)
    .then(r => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch(err => {
      console.error('Get ratings error:', err);
      return [];
    });
};

// GET /courses/{courseId}/reviews/average
export const getCourseAverageRating = (courseId) => {
  return client.get(`/courses/${courseId}/reviews/average`)
    .then(r => unwrap(r))
    .catch(err => {
      console.error('Get average rating error:', err);
      return { averageRating: 'N/A', totalReviews: 0 };
    });
};

// POST /courses/{courseId}/reviews
export const submitCourseReview = (courseId, payload) => {
  return client.post(`/courses/${courseId}/reviews`, payload).then(r => unwrap(r));
};

// POST /courses - Create new course (Teacher only)
export const createCourse = (payload) => {
  return client.post('/courses', payload).then(r => unwrap(r));
};

// PUT /courses/:courseId - Update course (Teacher only)
export const updateCourse = (courseId, payload) => {
  return client.put(`/courses/${courseId}`, payload).then(r => unwrap(r));
};

// DELETE /courses/:courseId - Delete course (Teacher only)
export const deleteCourse = (courseId, payload) => {
  return client.delete(`/courses/${courseId}`, { data: payload });
};
