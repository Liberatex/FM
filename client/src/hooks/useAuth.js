import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  };
}; 