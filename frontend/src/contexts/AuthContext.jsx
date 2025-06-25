import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set auth token
  const setAuthToken = (token) => {
    console.log('setAuthToken called with token:', token ? 'token provided' : 'no token');
    if (token) {
      console.log('Setting Authorization header and token in localStorage');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      console.log('Token set in localStorage and axios headers');
    } else {
      console.log('Removing Authorization header and token from localStorage');
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      console.log('Token removed from localStorage and axios headers');
    }
  };

  // Load user
  const loadUser = async () => {
    try {
      console.log('loadUser called');
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');
      
      if (!token) {
        console.log('No token found, setting loading to false');
        setLoading(false);
        return;
      }
      
      console.log('Setting auth token in axios headers');
      setAuthToken(token);
      
      console.log('Fetching user data from /api/auth/me');
      const res = await axios.get('/api/auth/me');
      console.log('User data received:', res.data);
      
      setUser(res.data);
      console.log('User set in context');
    } catch (err) {
      console.error('Failed to load user', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to load user');
      logout();
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      setError('');
      console.log('=== Starting registration process ===');
      console.log('Sending registration request to:', '/api/auth/register');
      console.log('Registration form data:', JSON.stringify(formData, null, 2));
      
      const res = await axios.post('/api/auth/register', formData);
      console.log('Registration successful, response:', res.data);
      
      if (!res.data.token) {
        console.error('No token received in registration response');
        throw new Error('No authentication token received');
      }
      
      console.log('Setting auth token from registration response');
      setAuthToken(res.data.token);
      
      console.log('Loading user data after registration');
      await loadUser();
      
      console.log('=== Registration process completed successfully ===');
      return { success: true };
      
    } catch (err) {
      console.error('=== Registration failed ===');
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      const errorMessage = err.response?.data?.message || 'Registration failed';
      console.error('Setting error message:', errorMessage);
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setError('');
      console.log('=== Starting login process ===');
      console.log('Sending login request to:', '/api/auth/login');
      console.log('Login form data:', { email: formData.email, password: '***' });
      
      const res = await axios.post('/api/auth/login', formData);
      console.log('Login successful, response:', { 
        hasToken: !!res.data.token,
        userData: res.data.user ? 'User data received' : 'No user data'
      });
      
      if (!res.data.token) {
        console.error('No token received in login response');
        throw new Error('No authentication token received');
      }
      
      console.log('Setting auth token from login response');
      setAuthToken(res.data.token);
      
      console.log('Loading user data after login');
      await loadUser();
      
      console.log('=== Login process completed successfully ===');
      return { success: true };
      
    } catch (err) {
      console.error('=== Login failed ===');
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: {
            'Content-Type': err.config?.headers?.['Content-Type'],
            'Authorization': err.config?.headers?.['Authorization'] ? 'Present' : 'Not present'
          }
        }
      });
      
      let errorMessage = 'Login failed';
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      console.error('Setting error message:', errorMessage);
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Logout user
  const logout = () => {
    console.log('=== Starting logout process ===');
    console.log('Clearing authentication state and token');
    
    // Clear auth token and user state
    setAuthToken(null);
    setUser(null);
    setError('');
    
    // Clear any additional stored data if needed
    // localStorage.removeItem('otherData');
    
    console.log('Logout completed successfully');
    console.log('=== Logout process completed ===');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        setError,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
