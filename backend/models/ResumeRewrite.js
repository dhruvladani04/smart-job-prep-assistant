const mongoose = require('mongoose');

const resumeRewriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Resume Rewrite'
  },
  content: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  starStory: {
    situation: String,
    task: String,
    action: String,
    result: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
resumeRewriteSchema.index({ userId: 1, isFavorite: 1 });
resumeRewriteSchema.index({ userId: 1, createdAt: -1 });

const ResumeRewrite = mongoose.model('ResumeRewrite', resumeRewriteSchema);

module.exports = ResumeRewrite;
