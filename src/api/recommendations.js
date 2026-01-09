import client from './client';

// Extract data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// GET /users/:userId/recommendations - Get course recommendations for user
export const getUserRecommendations = (userId) => {
  return client.get(`/users/${userId}/recommendations`)
    .then(r => {
      const data = unwrap(r);
      return Array.isArray(data) ? data : [];
    })
    .catch(err => {
      console.error('Get recommendations error:', err);
      return [];
    });
};
