import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Profile from './pages/Profile/Profile';
import Transactions from './pages/Transactions/Transactions';
import Budget from './pages/Budget/Budget';
import Goals from './pages/Goals/Goals';
import Investments from './pages/Investments/Investments';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useInterventions } from './hooks/useInterventions';

// Store
import { useAuthStore } from './store/authStore';
import { useInterventionStore } from './store/interventionStore';

// Styles
import './styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { interventions, addIntervention, updateIntervention } = useInterventions();
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isConnected && socket && isAuthenticated) {
      // Listen for AI interventions
      socket.on('ai_intervention', (intervention) => {
        addIntervention(intervention);
      });

      // Listen for real-time updates
      socket.on('financial_update', (update) => {
        // Handle real-time financial updates
        console.log('Financial update received:', update);
      });

      // Listen for notifications
      socket.on('notification', (notification) => {
        // Handle notifications
        console.log('Notification received:', notification);
      });

      return () => {
        socket.off('ai_intervention');
        socket.off('financial_update');
        socket.off('notification');
      };
    }
  }, [socket, isConnected, isAuthenticated, addIntervention]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              } />
              <Route path="/register" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budget" element={<Budget />} />
                <Route path="goals" element={<Goals />} />
                <Route path="investments" element={<Investments />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App; 