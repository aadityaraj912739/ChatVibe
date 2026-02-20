import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import CircularLoader from './components/CircularLoader';

// Helper function to add minimum loading time for better UX
const lazyWithMinDelay = (importFunc, minDelay = 1000) => {
  return lazy(() => {
    const startTime = Date.now();
    return importFunc().then((module) => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDelay - elapsedTime);
      
      return new Promise((resolve) => {
        setTimeout(() => resolve(module), remainingTime);
      });
    });
  });
};

// Lazy load components with minimum display time
const PrivateRoute = lazyWithMinDelay(() => import('./components/PrivateRoute'));
const Login = lazyWithMinDelay(() => import('./pages/Login'));
const Register = lazyWithMinDelay(() => import('./pages/Register'));
const Chat = lazyWithMinDelay(() => import('./pages/Chat'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<CircularLoader message="Loading ChatVibe..." />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/chat"
                    element={
                      <PrivateRoute>
                        <Chat />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/chat" />} />
                  <Route path="*" element={<Navigate to="/chat" />} />
                </Routes>
              </Suspense>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
