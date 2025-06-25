import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ResumeRewriteContext = createContext();

export const useResumeRewrites = () => {
  return useContext(ResumeRewriteContext);
};

export const ResumeRewriteProvider = ({ children }) => {
  const [rewrites, setRewrites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all resume rewrites for the current user
  const fetchRewrites = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/resume-rewrites');
      setRewrites(data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch resume rewrites');
      console.error('Error fetching resume rewrites:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new resume rewrite
  const createResumeRewrite = async (rewriteData) => {
    try {
      const { data } = await axios.post('/api/resume-rewrites', rewriteData);
      setRewrites([data.data, ...rewrites]);
      return data.data;
    } catch (err) {
      console.error('Error creating resume rewrite:', err);
      throw err;
    }
  };

  // Update a resume rewrite
  const updateResumeRewrite = async (id, updateData) => {
    try {
      const { data } = await axios.put(`/api/resume-rewrites/${id}`, updateData);
      setRewrites(rewrites.map(rewrite => 
        rewrite._id === id ? data.data : rewrite
      ));
      return data.data;
    } catch (err) {
      console.error('Error updating resume rewrite:', err);
      throw err;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (id) => {
    try {
      const { data } = await axios.patch(`/api/resume-rewrites/${id}/favorite`);
      setRewrites(rewrites.map(rewrite => 
        rewrite._id === id ? data.data : rewrite
      ));
      return data.data;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  // Delete a resume rewrite
  const deleteResumeRewrite = async (id) => {
    try {
      await axios.delete(`/api/resume-rewrites/${id}`);
      setRewrites(rewrites.filter(rewrite => rewrite._id !== id));
    } catch (err) {
      console.error('Error deleting resume rewrite:', err);
      throw err;
    }
  };

  // Fetch rewrites on component mount
  useEffect(() => {
    fetchRewrites();
  }, []);

  const value = {
    rewrites,
    loading,
    error,
    createResumeRewrite,
    updateResumeRewrite,
    deleteResumeRewrite,
    toggleFavorite,
    refreshRewrites: fetchRewrites
  };

  return (
    <ResumeRewriteContext.Provider value={value}>
      {children}
    </ResumeRewriteContext.Provider>
  );
};
