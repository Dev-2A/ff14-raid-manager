import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../api/auth';
import { setToken, removeToken } from '../api/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 로드 시 현재 사용자 확인
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiLogin(credentials);
      if (response.token) {
        setToken(response.token);
      }
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // 로그아웃 실패해도 로컬 상태는 초기화
      setUser(null);
      removeToken();
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};