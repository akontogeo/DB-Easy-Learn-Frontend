import client from './client';

const unwrap = (response) => response.data?.data || response.data;

export const login = (email) => {
  return client.post('/users/login', { email }).then(r => unwrap(r));
};
