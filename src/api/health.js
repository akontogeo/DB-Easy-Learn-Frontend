import client from './client';

// GET /health - Check if server is running
export const healthCheck = () => {
  return client.get('/health')
    .then(r => r.data)
    .catch(err => {
      console.error('Health check error:', err);
      return { success: false, message: 'Server unavailable' };
    });
};
