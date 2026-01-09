import client from './client';

// Extract data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// GET /categories - List all categories
export const getCategories = () => {
  return client.get('/categories')
    .then(r => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch(err => {
      console.error('Get categories error:', err);
      return [];
    });
};

// GET /categories/:categoryId - Get specific category
export const getCategory = (categoryId) => {
  return client.get(`/categories/${categoryId}`)
    .then(r => unwrap(r))
    .catch(err => {
      console.error('Get category error:', err);
      return null;
    });
};

// GET /categories/teacher/:teacherId - Get all categories by teacher
export const getCategoriesByTeacher = (teacherId) => {
  return client.get(`/categories/teacher/${teacherId}`)
    .then(r => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch(err => {
      console.error('Get teacher categories error:', err);
      return [];
    });
};

// GET /categories/:categoryId/courses - Get all courses in a category
export const getCategoryCourses = (categoryId) => {
  return client.get(`/categories/${categoryId}/courses`)
    .then(r => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch(err => {
      console.error('Get category courses error:', err);
      return [];
    });
};

// POST /categories - Create new category (Admin/Teacher only)
export const createCategory = (payload, authCredentials) => {
  const config = {};
  if (authCredentials) {
    const auth = btoa(`${authCredentials.username}:${authCredentials.password}`);
    config.headers = { Authorization: `Basic ${auth}` };
  }
  
  return client.post('/categories', payload, config).then(r => unwrap(r));
};

// PUT /categories/:categoryId - Update category (Admin/Teacher only)
export const updateCategory = (categoryId, payload, authCredentials) => {
  const config = {};
  if (authCredentials) {
    const auth = btoa(`${authCredentials.username}:${authCredentials.password}`);
    config.headers = { Authorization: `Basic ${auth}` };
  }
  
  return client.put(`/categories/${categoryId}`, payload, config).then(r => unwrap(r));
};

// DELETE /categories/:categoryId - Delete category (Admin only)
export const deleteCategory = (categoryId, authCredentials) => {
  const config = {};
  if (authCredentials) {
    const auth = btoa(`${authCredentials.username}:${authCredentials.password}`);
    config.headers = { Authorization: `Basic ${auth}` };
  }
  
  return client.delete(`/categories/${categoryId}`, config);
};
