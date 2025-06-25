import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeRewrites } from '../contexts/ResumeRewriteContext';
import ResumeList from '../components/resume/ResumeList';
import ResumeDetail from '../components/resume/ResumeDetail';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResumePage() {
  const [selectedRewrite, setSelectedRewrite] = useState(null);
  const [editingRewrite, setEditingRewrite] = useState(null);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    rewrites,
    createResumeRewrite,
    updateResumeRewrite,
    deleteResumeRewrite,
    toggleFavorite,
  } = useResumeRewrites();

  // Reset selected rewrite if it's no longer in the list
  useEffect(() => {
    if (selectedRewrite && !rewrites.some(r => r._id === selectedRewrite._id)) {
      setSelectedRewrite(null);
      setIsMobileDetailView(false);
    }
  }, [rewrites, selectedRewrite]);

  const handleCreateNew = () => {
    // Navigate to the resume rewriter with a new document
    navigate('/resume');
  };

  const handleSelectRewrite = (rewrite) => {
    setSelectedRewrite(rewrite);
    // On mobile, switch to detail view when a rewrite is selected
    if (window.innerWidth < 768) {
      setIsMobileDetailView(true);
    }
  };

  const handleBackToList = () => {
    setSelectedRewrite(null);
    setIsMobileDetailView(false);
  };

  const handleUpdateRewrite = async (id, updateData) => {
    try {
      const updatedRewrite = await updateResumeRewrite(id, updateData);
      if (selectedRewrite && selectedRewrite._id === id) {
        setSelectedRewrite(updatedRewrite);
      }
    } catch (error) {
      console.error('Error updating rewrite:', error);
    }
  };

  const handleDeleteRewrite = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume rewrite? This action cannot be undone.')) {
      try {
        await deleteResumeRewrite(id);
        if (selectedRewrite && selectedRewrite._id === id) {
          setSelectedRewrite(null);
          setIsMobileDetailView(false);
        }
      } catch (error) {
        console.error('Error deleting rewrite:', error);
      }
    }
  };

  const handleEditRewrite = (rewrite) => {
    setEditingRewrite(rewrite);
    navigate(`/resume/edit/${rewrite._id}`);
  };

  const handleSaveRewrite = async () => {
    // Refresh the list of rewrites after saving
    if (updateResumeRewrite) {
      await updateResumeRewrite();
    }
    setEditingRewrite(null);
    navigate('/my-resumes');
  };

  // Check if we should show the list view (always on desktop, or on mobile when detail is not selected)
  const showListView = !isMobileDetailView || window.innerWidth >= 768;
  // Check if we should show the detail view (always on desktop if selected, or on mobile when in detail view)
  const showDetailView = selectedRewrite && (isMobileDetailView || window.innerWidth >= 768);

  // Check if we're in edit mode via URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'resume' && pathParts[2] === 'edit' && pathParts[3]) {
      const rewriteId = pathParts[3];
      const rewrite = rewrites.find(r => r._id === rewriteId);
      if (rewrite) {
        setEditingRewrite(rewrite);
      }
    }
  }, [location.pathname, rewrites]);

  if (editingRewrite) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.button
            onClick={() => {
              setEditingRewrite(null);
              navigate('/my-resumes');
            }}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
            whileHover={{ x: -4 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Resumes
          </motion.button>
          <ResumeRewriter 
            existingRewrite={editingRewrite} 
            onSave={handleSaveRewrite}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {showListView && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className={`${showDetailView ? 'hidden md:block md:w-1/2 lg:w-2/5 xl:w-1/3 md:pr-6' : 'w-full'}`}
            >
              <ResumeList
                onSelectRewrite={handleSelectRewrite}
                onEditRewrite={handleEditRewrite}
                selectedRewriteId={selectedRewrite?._id}
                onCreateNew={handleCreateNew}
              />
            </motion.div>
          )}

          {showDetailView && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`${showListView ? 'md:block md:w-1/2 lg:w-3/5 xl:w-2/3' : 'w-full'}`}
            >
              <ResumeDetail
                rewrite={selectedRewrite}
                onBack={handleBackToList}
                onEdit={() => handleEditRewrite(selectedRewrite)}
                onUpdate={handleUpdateRewrite}
                onDelete={handleDeleteRewrite}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
