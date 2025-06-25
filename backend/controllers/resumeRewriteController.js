const ResumeRewrite = require('../models/ResumeRewrite');
const asyncHandler = require('express-async-handler');

// @desc    Create a new resume rewrite
// @route   POST /api/resume-rewrites
// @access  Private
const createResumeRewrite = asyncHandler(async (req, res) => {
  const { title, content, jobDescription, starStory, tags } = req.body;

  const rewrite = await ResumeRewrite.create({
    userId: req.user.id,
    title: title || 'Untitled Resume Rewrite',
    content,
    jobDescription,
    starStory,
    tags: Array.isArray(tags) ? tags : []
  });

  res.status(201).json({
    success: true,
    data: rewrite
  });
});

// @desc    Get all resume rewrites for the authenticated user
// @route   GET /api/resume-rewrites
// @access  Private
const getResumeRewrites = asyncHandler(async (req, res) => {
  const { favorite } = req.query;
  const query = { userId: req.user.id };

  if (favorite === 'true') {
    query.isFavorite = true;
  }

  const rewrites = await ResumeRewrite.find(query)
    .sort({ isFavorite: -1, updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: rewrites.length,
    data: rewrites
  });
});

// @desc    Get single resume rewrite
// @route   GET /api/resume-rewrites/:id
// @access  Private
const getResumeRewrite = asyncHandler(async (req, res) => {
  const rewrite = await ResumeRewrite.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!rewrite) {
    return res.status(404).json({
      success: false,
      error: 'Resume rewrite not found'
    });
  }

  res.status(200).json({
    success: true,
    data: rewrite
  });
});

// @desc    Update resume rewrite
// @route   PUT /api/resume-rewrites/:id
// @access  Private
const updateResumeRewrite = asyncHandler(async (req, res) => {
  const { title, content, jobDescription, isFavorite, tags, starStory } = req.body;
  const updateData = {};

  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (jobDescription) updateData.jobDescription = jobDescription;
  if (typeof isFavorite === 'boolean') updateData.isFavorite = isFavorite;
  if (Array.isArray(tags)) updateData.tags = tags;
  if (starStory) updateData.starStory = starStory;

  const rewrite = await ResumeRewrite.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!rewrite) {
    return res.status(404).json({
      success: false,
      error: 'Resume rewrite not found'
    });
  }

  res.status(200).json({
    success: true,
    data: rewrite
  });
});

// @desc    Delete resume rewrite
// @route   DELETE /api/resume-rewrites/:id
// @access  Private
const deleteResumeRewrite = asyncHandler(async (req, res) => {
  const rewrite = await ResumeRewrite.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!rewrite) {
    return res.status(404).json({
      success: false,
      error: 'Resume rewrite not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Toggle favorite status of a resume rewrite
// @route   PATCH /api/resume-rewrites/:id/favorite
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const rewrite = await ResumeRewrite.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!rewrite) {
    return res.status(404).json({
      success: false,
      error: 'Resume rewrite not found'
    });
  }

  rewrite.isFavorite = !rewrite.isFavorite;
  await rewrite.save();

  res.status(200).json({
    success: true,
    data: rewrite
  });
});

module.exports = {
  createResumeRewrite,
  getResumeRewrites,
  getResumeRewrite,
  updateResumeRewrite,
  deleteResumeRewrite,
  toggleFavorite
};
