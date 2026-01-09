import client from './client';

// Extract user data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// Fetch user profile by ID
export const getUserProfile = (userId) => {
  return client.get(`/users/${userId}`).then(r => unwrap(r));
};

// Update user profile data
export const updateUser = (userId, payload) => {
  return client.put(`/users/${userId}`, payload).then(r => unwrap(r));
};

// Get list of courses user is enrolled in
export const getUserEnrolledCourses = (userId) => {
  return client.get(`/users/${userId}/courses`)
    .then(r => {
      const data = unwrap(r);
      const courses = Array.isArray(data) ? data : [];
      // Transform backend format to frontend format
      return courses.map(course => ({
        course_id: course.id,
        course_title: course.title,
        course_description: course.shortDescription,
        category_id: course.category,
        thumbnailUrl: course.thumbnailUrl
      }));
    })
    .catch(() => []);
};

// Enroll user in a course
export const enrollInCourse = (userId, courseId) => {
  return client.post(`/users/${userId}/courses`, { courseId }).then(r => unwrap(r));
};

// Withdraw user from an enrolled course
export const withdrawFromCourse = (userId, courseId) => {
  return client.delete(`/users/${userId}/courses/${courseId}`);
};

// Get user's total score for a specific course
export const getCourseScore = (userId, courseId) => {
  return client.get(`/users/${userId}/courses/${courseId}/score`).then(r => unwrap(r));
};
