import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import ResumeRewriter from '../components/ResumeRewriter';
import { useResumeRewrites } from '../contexts/ResumeRewriteContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const ResumeRewriterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rewrites } = useResumeRewrites();
  const [editingRewrite, setEditingRewrite] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const rewrite = rewrites.find(r => r._id === id);
      if (rewrite) {
        setEditingRewrite(rewrite);
      }
      setLoading(false);
    }
  }, [id, rewrites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-2 text-gray-900"
            variants={itemVariants}
          >
            Resume Rewriter
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {editingRewrite ? 'Edit your resume' : 'Transform your resume bullets into powerful, ATS-optimized achievements'}
          </motion.p>
          {editingRewrite && (
            <motion.button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              variants={itemVariants}
            >
              <FiArrowLeft className="mr-1" /> Back to Resumes
            </motion.button>
          )}
        </motion.div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <ResumeRewriter existingRewrite={editingRewrite} />
        </motion.div>
      </main>
    </div>
  );
};

export default ResumeRewriterPage;
