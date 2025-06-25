import { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiDownload, FiRefreshCw, FiCopy, FiCheck, FiInfo, FiFileText, FiZap, FiSave } from 'react-icons/fi';
import { FaStar as FaStarSolid, FaRegStar } from 'react-icons/fa';
import { useResumeRewrites } from '../contexts/ResumeRewriteContext';
import { useAuth } from '../contexts/AuthContext';

// Simple stopword list
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'will', 'you', 'your',
  'are', 'our', 'to', 'of', 'in', 'a', 'an', 'on', 'by'
]);

// Utility to strip markdown from text
const stripMarkdown = (text) => text
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\*(.*?)\*/g, '$1')
  .replace(/^[\-*+]\s*/gm, '')
  .trim();

// Extract keywords from text
const extractKeywords = (text) => Array.from(
  new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOPWORDS.has(w))
  )
);

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.03,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.2,
    }
  },
  tap: { 
    scale: 0.98 
  }
};

console.log('ResumeRewriter component rendering');

const ResumeRewriter = ({ existingRewrite = null }) => {
  console.log('Inside ResumeRewriter component', { existingRewrite });
  const [jobDescription, setJobDescription] = useState(existingRewrite?.jobDescription || '');
  const [resumeBullet, setResumeBullet] = useState(existingRewrite?.content || '');
  const [title, setTitle] = useState(existingRewrite?.title || '');
  const [bullets, setBullets] = useState(existingRewrite?.bullets || []);
  const [options, setOptions] = useState(existingRewrite?.options || []);
  const [missing, setMissing] = useState(existingRewrite?.missingKeywords || []);
  const [keywordMatches, setKeywordMatches] = useState(existingRewrite?.keywordMatches || []);
  const [keyChanges, setKeyChanges] = useState(existingRewrite?.keyChanges || []);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [star, setStar] = useState(existingRewrite?.isFavorite || false);
  const { createResumeRewrite, updateResumeRewrite } = useResumeRewrites?.() || {};
  const { user } = useAuth?.() || {};
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab] = useState('upload'); // 'upload' or 'manual'

  // Handle file upload + extract bullets via Gemini
  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('resume', acceptedFiles[0]);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload-resume`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setBullets(data.bullets);
      if (data.bullets.length) setResumeBullet(data.bullets[0]);
    } catch (err) {
      console.error(err);
      alert('Failed to extract bullets');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  // Compute present and missing keywords for a given text
  const computeMatch = useCallback((text) => {
    const keys = extractKeywords(jobDescription);
    const present = keys.filter(k => text.toLowerCase().includes(k));
    return { present, missing: keys.filter(k => !present.includes(k)) };
  }, [jobDescription]);

  // Rewrite selected bullet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeBullet || !jobDescription) return;
    setLoading(true);

    // set missing keywords for original bullet
    setMissing(computeMatch(resumeBullet).missing);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/rewrite-resume`,
        { jobDescription, resumeBullet }
      );
      // Clean markdown formatting and extract key changes
      const cleaned = data.rewritten
        .split('\n\n')
        .map(opt => stripMarkdown(opt))
        .filter(Boolean);
      
      // Extract key changes if available in the response
      const changes = data.keyChanges || [];
      
      setOptions(cleaned);
      setKeyChanges(changes);

      // compute keyword match counts for each suggestion
      setKeywordMatches(cleaned.map(text => computeMatch(text).present.length));

      setStar(null);
    } catch (err) {
      console.error(err);
      alert('Error rewriting bullet.');
    } finally {
      setLoading(false);
    }
  };

  // Generate STAR story
  const generateStarStory = async (e) => {
    e.preventDefault();
    if (loading1) return; 
    if (!resumeBullet) return;
    setLoading1(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/generate-star`,
        { bullet: resumeBullet }
      );
      setStar(data.star);
    } catch (err) {
      console.error(err);
      alert('STAR generation failed');
    }
    finally {
      setLoading1(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Export selected content to PDF
  // Handle save to database
  const handleSaveToDatabase = async () => {
    if (!resumeBullet || !jobDescription) {
      alert('Please enter both job description and resume content');
      return;
    }

    if ((!createResumeRewrite && !existingRewrite) || (existingRewrite && !updateResumeRewrite)) {
      alert('Save functionality is not available. Please make sure you are logged in and try again.');
      return;
    }

    try {
      setIsSaving(true);
      const rewriteData = {
        title: title || `Resume Rewrite ${new Date().toLocaleDateString()}`,
        content: resumeBullet,
        jobDescription,
        bullets,
        options,
        missingKeywords: missing,
        keywordMatches,
        keyChanges,
        isFavorite: star
      };

      if (existingRewrite?._id) {
        // Update existing rewrite
        if (updateResumeRewrite) {
          await updateResumeRewrite(existingRewrite._id, rewriteData);
          alert('Resume rewrite updated successfully!');
        } else {
          console.error('updateResumeRewrite is not available');
        }
      } else {
        // Create new rewrite
        if (createResumeRewrite) {
          await createResumeRewrite(rewriteData);
          alert('Resume rewrite saved successfully!');
        } else {
          console.error('createResumeRewrite is not available');
        }
      }
    } catch (error) {
      console.error('Error saving resume rewrite:', error);
      alert('Failed to save resume rewrite');
    } finally {
      setIsSaving(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 10;
    doc.setFontSize(12);

    const addText = (text) => {
      const lines = doc.splitTextToSize(text, 180);
      lines.forEach((line) => {
        if (y + 8 > pageHeight - 10) {
          doc.addPage();
          y = 10;
          doc.setFontSize(12);
        }
        doc.text(line, 10, y);
        y += 8;
      });
      y += 4;
    };

    // Resume Bullet
    addText('Resume Bullet:');
    addText(resumeBullet);

    // Job Description
    addText('Job Description:');
    addText(jobDescription);

    // NEW: Missing Keywords
    if (missing.length) {
      addText('Missing Keywords: ' + missing.join(', '));
    }

    // Rewrite Suggestions
    addText('Rewrite Suggestions:');
    options.forEach((opt, idx) => {
      addText(opt + `  (Matches: ${keywordMatches[idx]}/${extractKeywords(jobDescription).length})`);
    });

    // STAR Story
    if (star) {
      addText('STAR Story:');
      addText(`Situation: ${star.situation}`);
      addText(`Task: ${star.task}`);
      addText(`Action: ${star.action}`);
      addText(`Result: ${star.result}`);
    }

    doc.save('job_prep.pdf');
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      {/* Title Input */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this rewrite"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Job Description Input */}
      <div className="mb-6">
        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description
        </label>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upload' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FiUpload className="inline mr-2" />
            Upload Resume
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual'
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FiFileText className="inline mr-2" />
            Enter Manually
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'upload' ? (
          <div 
            {...getRootProps()} 
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm text-gray-600 justify-center">
              <span className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500">
                Upload a file
              </span>
              <p className="ml-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX up to 10MB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="manualBullet" className="block text-sm font-medium text-gray-700">
              Enter Your Bullet Point
            </label>
            <textarea
              id="manualBullet"
              value={resumeBullet}
              onChange={(e) => setResumeBullet(e.target.value)}
              placeholder="Enter your resume bullet point here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            />
          </div>
        )}

        {/* Bullet Selection (only shown when we have bullets from upload) */}
        {bullets.length > 0 && activeTab === 'upload' && (
          <div className="space-y-2">
            <label htmlFor="resumeBullet" className="block text-sm font-medium text-gray-700">
              Select a bullet point to enhance
            </label>
            <select
              id="resumeBullet"
              value={resumeBullet}
              onChange={(e) => setResumeBullet(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {bullets.map((bullet, i) => (
                <option key={i} value={bullet} className="truncate">
                  {bullet.length > 100 ? bullet.substring(0, 100) + '...' : bullet}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={handleSubmit}
          disabled={!jobDescription || !resumeBullet || loading}
          className={`w-full py-3 px-6 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            !jobDescription || !resumeBullet || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'
          }`}
          variants={buttonVariants}
          whileHover={!jobDescription || !resumeBullet || loading ? {} : 'hover'}
          whileTap={!jobDescription || !resumeBullet || loading ? {} : 'tap'}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <FiRefreshCw className="animate-spin mr-2" />
              Generating...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FiZap className="mr-2" />
              Enhance My Bullet
            </div>
          )}
        </motion.button>

        <button
          onClick={generateStarStory}
          disabled={loading1}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {loading1 ? 'Generating STAR Story...' : 'Generate STAR Story'}
        </button>

        <motion.button
          onClick={exportPDF}
          className="px-4 py-2 bg-gray-800 text-white rounded flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiDownload className="mr-2" />
          Export PDF
        </motion.button>
        
        <motion.button
          onClick={handleSaveToDatabase}
          disabled={!jobDescription || !resumeBullet || isSaving}
          className={`px-4 py-2 rounded flex items-center justify-center ${
            !jobDescription || !resumeBullet || isSaving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
          whileHover={!jobDescription || !resumeBullet || isSaving ? {} : { scale: 1.03 }}
          whileTap={!jobDescription || !resumeBullet || isSaving ? {} : { scale: 0.98 }}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              Save Resume
            </>
          )}
        </motion.button>
      </div>

      {/* Rewrite Suggestions Section */}
      <AnimatePresence>
        {options.length > 0 && (
          <motion.div 
            className="mt-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  Enhanced Bullets
                </span>
              </h3>
              {missing.length > 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {missing.length} keywords from the job description not found
                </div>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {options.map((option, i) => {
                const matchCount = keywordMatches[i] || 0;
                const matchPercentage = Math.round((matchCount / (missing.length + matchCount)) * 100) || 0;
                
                return (
                  <motion.div
                    key={i}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                      i === star 
                        ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-[1.02]' 
                        : 'border-gray-100 bg-white hover:border-blue-100 hover:shadow-md'
                    }`}
                    whileHover={{ y: -2 }}
                    layout
                  >
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <motion.button
                        onClick={() => {
                          copyToClipboard(option, i);
                        }}
                        className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Copy to clipboard"
                      >
                        {copiedIndex === i ? (
                          <FiCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <FiCopy className="w-4 h-4" />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => setStar(i === star ? null : i)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={i === star ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {i === star ? (
                          <FaStarSolid className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <FaRegStar className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                    
                    <p className="pr-8 text-gray-700">{option}</p>
                    
                    {matchCount > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Keyword match</span>
                          <span>{matchPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              matchPercentage > 70 ? 'bg-green-500' : 
                              matchPercentage > 40 ? 'bg-blue-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${matchPercentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Matches {matchCount} {matchCount === 1 ? 'keyword' : 'keywords'} from the job description
                        </div>
                        
                        {/* Key Changes Section */}
                        {keyChanges[i] && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <h4 className="text-sm font-medium text-gray-800 mb-2">Key changes and why:</h4>
                            <ul className="text-xs text-gray-600 space-y-1.5">
                              {Array.isArray(keyChanges[i]) ? (
                                keyChanges[i].map((change, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-1.5">•</span>
                                    <span>{change}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="flex items-start">
                                  <span className="text-green-500 mr-1.5">•</span>
                                  <span>{keyChanges[i]}</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <FiInfo className="mr-2" /> Tips for better results
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                <li>Include specific metrics and numbers in your original bullet points</li>
                <li>Use action verbs at the beginning of each bullet point</li>
                <li>Focus on achievements rather than just responsibilities</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {star && (
        <motion.div 
          className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              STAR Story
            </span>
          </h2>
          <motion.button
            onClick={() => handleCopy(`Situation: ${star.situation}\nTask: ${star.task}\nAction: ${star.action}\nResult: ${star.result}`)}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Copy STAR story"
          >
            <FiCopy className="w-5 h-5" />
          </motion.button>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Situation</h3>
              <p className="text-gray-700 mt-1">{star.situation}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Task</h3>
              <p className="text-gray-700 mt-1">{star.task}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Action</h3>
              <p className="text-gray-700 mt-1">{star.action}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-medium text-green-800">Result</h3>
              <p className="text-gray-700 mt-1">{star.result}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ResumeRewriter;
