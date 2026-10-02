import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state by verifying saved token
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res?.data) {
            setUser(res.data);
          } else {
            // Token invalid or expired
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Session expired or invalid token:', error.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in user and persist token
   */
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const { user: userData, token: jwtToken } = res.data;

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData, token: jwtToken };
    } catch (error) {
      return {
        success: false,
        statusCode: error.statusCode || error.response?.status,
        message: error.message || 'Login failed. Please check your credentials.',
        errors: error.errors || [],
        data: error.data || error.response?.data?.data
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user (Dispatches Email OTP, does not auto-login)
   */
  const signup = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authService.signup(userData);
      return {
        success: true,
        message: res.message || 'Registration successful. Verification code sent.',
        data: res.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed. Please check your details.',
        errors: error.errors || []
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify email OTP and establish session
   */
  const verifyEmail = async (verifyData) => {
    setIsLoading(true);
    try {
      const res = await authService.verifyEmail(verifyData);
      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return {
        success: true,
        message: res.message || 'Email verified successfully!',
        data: res.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Email verification failed',
        errors: error.errors || []
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend Email OTP
   */
  const resendEmailOTP = async (data) => {
    try {
      const res = await authService.resendEmailOTP(data);
      return { success: true, message: res.message || 'Verification code resent successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to resend verification code'
      };
    }
  };

  /**
   * Send Phone Verification OTP
   */
  const sendPhoneOTP = async (data = {}) => {
    try {
      const res = await authService.sendPhoneOTP(data);
      return { success: true, message: res.message || 'Phone OTP sent successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send phone OTP'
      };
    }
  };

  /**
   * Verify Phone OTP
   */
  const verifyPhoneOTP = async (data) => {
    try {
      const res = await authService.verifyPhoneOTP(data);
      if (res?.data?.user) {
        setUser(res.data.user);
      }
      return { success: true, message: res.message || 'Phone number verified successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify phone number'
      };
    }
  };

  /**
   * Resend Phone OTP
   */
  const resendPhoneOTP = async (data = {}) => {
    try {
      const res = await authService.resendPhoneOTP(data);
      return { success: true, message: res.message || 'Phone OTP resent successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to resend phone OTP'
      };
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  /**
   * Update profile details
   */
  const updateUserProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile',
        errors: error.errors || []
      };
    }
  };

  /**
   * Change user password
   */
  const changeUserPassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to change password',
        errors: error.errors || []
      };
    }
  };

  /**
   * Refresh current user profile
   */
  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res?.data) setUser(res.data);
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isEmailVerified: !!user?.isEmailVerified,
    isPhoneVerified: !!user?.isPhoneVerified,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    signup,
    verifyEmail,
    resendEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP,
    resendPhoneOTP,
    logout,
    updateUserProfile,
    changeUserPassword,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
