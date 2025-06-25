import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiCopy, FiDownload, FiStar, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import { format } from 'date-fns';

export default function ResumeDetail({ rewrite, onBack, onUpdate, onDelete, onToggleFavorite }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(rewrite.content);
  const [editedJobDescription, setEditedJobDescription] = useState(rewrite.jobDescription);
  
  const handleSave = () => {
    onUpdate(rewrite._id, {
      content: editedContent,
      jobDescription: editedJobDescription
    });
    setIsEditing(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(rewrite.content);
    // You might want to add a toast notification here
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([rewrite.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${rewrite.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formattedDate = format(new Date(rewrite.updatedAt), 'MMMM d, yyyy');

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex flex-col h-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Back to list"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{rewrite.title}</h2>
              <p className="text-sm text-gray-500">Last updated on {formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite(rewrite._id)}
              className={`p-2 rounded-md ${
                rewrite.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                  : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
              }`}
              aria-label={rewrite.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiStar className={`w-5 h-5 ${rewrite.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
              aria-label="Copy to clipboard"
            >
              <FiCopy className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md"
              aria-label="Download"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(rewrite._id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
              aria-label="Delete"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Job Description */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Job Description</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FiEdit2 className="mr-1.5 h-4 w-4" />
                Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  value={editedJobDescription}
                  onChange={(e) => setEditedJobDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                />
              </div>
              <div>
                <label htmlFor="resumeContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Resume Content
                </label>
                <textarea
                  id="resumeContent"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(rewrite.content);
                    setEditedJobDescription(rewrite.jobDescription);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700">
                {rewrite.jobDescription || 'No job description provided.'}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Resume Content */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Your Enhanced Resume Content
          </h3>
          <div className="prose max-w-none">
            {isEditing ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Edit the resume content in the form above.</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="whitespace-pre-line text-gray-800">
                  {rewrite.content}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* STAR Story (if available) */}
        {rewrite.starStory && (
          <>
            <div className="border-t border-gray-200"></div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                STAR Story
              </h3>
              <div className="space-y-4">
                {Object.entries(rewrite.starStory).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <h4 className="text-sm font-medium text-gray-700 capitalize">
                        {key}:
                      </h4>
                      <p className="mt-1 text-gray-600">{value}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
