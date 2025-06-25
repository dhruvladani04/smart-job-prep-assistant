import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiStar, FiClock, FiCalendar } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';

export default function ResumeCard({ 
  rewrite, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  isSelected,
  onSelectRewrite 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(rewrite.title);

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(rewrite);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(rewrite._id);
  };

  const handleCardClick = () => {
    if (onSelectRewrite) {
      onSelectRewrite(rewrite);
    }
  };

  const formattedDate = format(new Date(rewrite.updatedAt), 'MMM d, yyyy');
  const timeAgo = formatDistanceToNow(new Date(rewrite.updatedAt), { addSuffix: true });

  return (
    <motion.div
      className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
        isSelected ? 'border-blue-500' : 'border-gray-100 hover:border-gray-200'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex flex-col space-y-1">
        <button
          onClick={handleEditClick}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          aria-label="Edit resume"
          title="Edit resume"
        >
          <FiEdit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleFavoriteClick}
          className={`p-1.5 rounded-full transition-colors ${
            rewrite.isFavorite
              ? 'text-yellow-400 hover:text-yellow-500 bg-yellow-50'
              : 'text-gray-300 hover:text-gray-400 hover:bg-gray-50'
          }`}
          aria-label={rewrite.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={rewrite.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FiStar className={`w-4 h-4 ${rewrite.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-5 pt-8">
        {/* Title */}
        <div className="mb-3 pr-10">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {rewrite.title}
          </h3>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3">
            {rewrite.content?.substring(0, 150) || 'No content available'}{rewrite.content?.length > 150 ? '...' : ''}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <FiCalendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2" title={`Updated ${timeAgo}`}>
            <FiClock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {(isHovered || isSelected) && onDelete && (
        <div className="absolute bottom-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this resume rewrite?')) {
                onDelete(rewrite._id);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Delete"
            title="Delete resume"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
