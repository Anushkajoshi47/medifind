import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState({ doctors: [], hospitals: [] });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await authAPI.getProfile();
        setUser(res.data.data);
        setBookmarks({
          doctors: res.data.data.bookmarked_doctors || [],
          hospitals: res.data.data.bookmarked_hospitals || [],
        });
      }
    } catch (e) {
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data.data;
    await AsyncStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user: userData } = res.data.data;
    await AsyncStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    setBookmarks({ doctors: [], hospitals: [] });
  };

  const toggleBookmark = async (type, id) => {
    try {
      const res = await authAPI.toggleBookmark({ type, id });
      if (type === 'doctor') {
        setBookmarks((prev) => ({ ...prev, doctors: res.data.data.list }));
      } else {
        setBookmarks((prev) => ({ ...prev, hospitals: res.data.data.list }));
      }
    } catch (e) {}
  };

  const isBookmarked = (type, id) => {
    return type === 'doctor'
      ? bookmarks.doctors.includes(id)
      : bookmarks.hospitals.includes(id);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, toggleBookmark, isBookmarked, bookmarks }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
