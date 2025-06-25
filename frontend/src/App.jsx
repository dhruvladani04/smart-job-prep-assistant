import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResumeRewriteProvider } from './contexts/ResumeRewriteContext';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeRewriterPage from './pages/ResumeRewriterPage';
import ResumePage from './pages/ResumePage';
import ProtectedRoute from './components/ProtectedRoute';
import { FaGithub, FaLinkedin, FaFileAlt, FaInstagram } from 'react-icons/fa';

// Animation variants
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

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resume" element={
                  <ResumeRewriteProvider>
                    <ResumeRewriterPage />
                  </ResumeRewriteProvider>
                } />
                <Route path="/my-resumes" element={
                  <ResumeRewriteProvider>
                    <ResumePage />
                  </ResumeRewriteProvider>
                } />
                <Route path="/resume/edit/:id" element={
                  <ResumeRewriteProvider>
                    <ResumeRewriterPage />
                  </ResumeRewriteProvider>
                } />
              </Route>
            </Routes>
          </main>
          <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <motion.div 
                  className="mb-4 md:mb-0"
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="text-xl font-semibold">Smart Job Prep Assistant</p>
                  <p className="text-gray-400"> {currentYear} All Rights Reserved</p>
                </motion.div>
                
                <div className="flex space-x-6">
                  <motion.a 
                    href="https://github.com/dhruvladani04" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaGithub className="w-6 h-6" />
                  </motion.a>
                  <motion.a 
                    href="https://linkedin.com/in/dhruv-ladani-a65578252/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaLinkedin className="w-6 h-6" />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="text-gray-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaInstagram className="w-6 h-6" />
                  </motion.a>
                </div>
              </div>
              
              <motion.div 
                className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p>Made with  for job seekers everywhere</p>
              </motion.div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;