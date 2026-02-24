import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import CircularLoader from './components/CircularLoader';
// Import Login and Register directly for instant loading
import Login from './pages/Login';
import Register from './pages/Register';

// Only lazy load heavy components (Chat and PrivateRoute)
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));
const Chat = lazy(() => import('./pages/Chat'));

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
