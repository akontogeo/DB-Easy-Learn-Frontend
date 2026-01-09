import React from 'react';
import AppRouter from './router/AppRouter';
import { AuthProvider } from './context/AuthContext';

// Main application component - wraps app with auth context and routing
function App(){
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
