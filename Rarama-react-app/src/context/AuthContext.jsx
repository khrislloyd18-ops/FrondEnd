import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

const _RAW_AUTH_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000/api';
// Enforce HTTPS for all API calls in production
const _SAFE_AUTH_URL =
  process.env.NODE_ENV === 'production'
    ? _RAW_AUTH_URL.replace(/^http:\/\//, 'https://')
    : _RAW_AUTH_URL;
const API_BASE_URL = _SAFE_AUTH_URL.replace(/\/api\/?$/, '');

const toAbsoluteAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  return `${API_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const normalizeUserPayload = (value) => {
  if (!value || typeof value !== 'object') return value;

  const normalized = { ...value };
  const normalizedAvatar =
    toAbsoluteAssetUrl(normalized.avatar_url) ||
    toAbsoluteAssetUrl(normalized.profile_picture) ||
    toAbsoluteAssetUrl(normalized.avatar) ||
    toAbsoluteAssetUrl(normalized.image) ||
    '';

  if (normalizedAvatar) {
    normalized.avatar_url = normalizedAvatar;
    normalized.profile_picture = normalizedAvatar;
  }

  return normalized;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user and token in localStorage
    const savedUserRaw = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUserRaw && savedToken) {
      try {
        const parsed = JSON.parse(savedUserRaw);
        setUser(normalizeUserPayload(parsed));
      } catch (parseError) {
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    const normalizedUser = normalizeUserPayload(userData);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const updateUser = useCallback((userUpdates) => {
    setUser((currentUser) => {
      const resolvedUpdates =
        typeof userUpdates === 'function'
          ? userUpdates(currentUser || {})
          : (userUpdates || {});

      const nextUser = normalizeUserPayload({
        ...(currentUser || {}),
        ...resolvedUpdates,
      });

      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const isAuthenticated = !!user;

  const contextValue = useMemo(
    () => ({ user, login, logout, updateUser, loading, isAuthenticated }),
    [user, login, logout, updateUser, loading, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};