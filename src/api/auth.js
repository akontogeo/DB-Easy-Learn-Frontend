import client from './client';

// Extract data from API response wrapper
const unwrap = (response) => response.data?.data || response.data;

// Login with email only
export const login = (email) => {
  return client.post('/users/login', { email }).then(r => unwrap(r));
};
