const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  getProjectReviews,
  updateReview,
  deleteReview,
  getReviewerStats
} = require('../controllers/reviewController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

const router = express.Router();

// Reviewer stats
router.get('/stats/overview', protect, authorize('reviewer', 'admin'), getReviewerStats);

// Project reviews
router.route('/:projectId')
  .get(protect, getProjectReviews)
  .post(
    protect,
    authorize('reviewer', 'admin'),
    [
      body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
      body('feedback').trim().notEmpty().withMessage('Feedback is required')
    ],
    createReview
  );

// Single review operations
router.route('/edit/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
