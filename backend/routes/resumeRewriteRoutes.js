const express = require('express');
const router = express.Router();
const {
  createResumeRewrite,
  getResumeRewrites,
  getResumeRewrite,
  updateResumeRewrite,
  deleteResumeRewrite,
  toggleFavorite
} = require('../controllers/resumeRewriteController');
const { protect } = require('../middleware/auth');

// All routes below are protected and require authentication
router.use(protect);

// GET /api/resume-rewrites
// POST /api/resume-rewrites
router.route('/')
  .get(getResumeRewrites)
  .post(createResumeRewrite);

// GET /api/resume-rewrites/:id
// PUT /api/resume-rewrites/:id
// DELETE /api/resume-rewrites/:id
router.route('/:id')
  .get(getResumeRewrite)
  .put(updateResumeRewrite)
  .delete(deleteResumeRewrite);

// PATCH /api/resume-rewrites/:id/favorite
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
