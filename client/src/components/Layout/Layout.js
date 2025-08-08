import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import AIInterventionModal from '../AI/AIInterventionModal';
import NotificationPanel from '../Notifications/NotificationPanel';
import LoadingSpinner from '../UI/LoadingSpinner';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useInterventions } from '../../hooks/useInterventions';
import { useTheme } from '../../hooks/useTheme';

// Store
import { useInterventionStore } from '../../store/interventionStore';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { interventions, markAsRead } = useInterventions();
  const { theme, toggleTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentIntervention, setCurrentIntervention] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get unread interventions
  const unreadInterventions = interventions.filter(i => !i.isRead);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Show intervention modal for new interventions
    const newIntervention = interventions.find(i => !i.isRead && !i.isShown);
    if (newIntervention) {
      setCurrentIntervention(newIntervention);
    }
  }, [interventions]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterventionClose = () => {
    if (currentIntervention) {
      markAsRead(currentIntervention.id);
      setCurrentIntervention(null);
    }
  };

  const handleInterventionAction = async (interventionId, action) => {
    try {
      // Handle intervention action
      console.log('Intervention action:', { interventionId, action });
      markAsRead(interventionId);
      setCurrentIntervention(null);
    } catch (error) {
      console.error('Error handling intervention action:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${theme}`}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl lg:hidden"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
          onUserMenuClick={() => setUserMenuOpen(!userMenuOpen)}
          unreadCount={unreadInterventions.length}
          user={user}
        />

        {/* User menu dropdown */}
        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 top-16 z-30 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 mr-3" />
                  ) : (
                    <Moon className="w-4 h-4 mr-3" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification panel */}
        <AnimatePresence>
          {notificationPanelOpen && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl"
            >
              <NotificationPanel
                interventions={interventions}
                onClose={() => setNotificationPanelOpen(false)}
                onInterventionClick={(intervention) => {
                  setCurrentIntervention(intervention);
                  setNotificationPanelOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* AI Intervention Modal */}
      <AnimatePresence>
        {currentIntervention && (
          <AIInterventionModal
            intervention={currentIntervention}
            onClose={handleInterventionClose}
            onAction={handleInterventionAction}
          />
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(userMenuOpen || notificationPanelOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setUserMenuOpen(false);
            setNotificationPanelOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Layout; 