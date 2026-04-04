const Review = require('../models/Review');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// @desc    Create a review for a project
// @route   POST /api/reviews/:projectId
// @access  Private (Reviewer, Admin)
exports.createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      project: req.params.projectId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this project'
      });
    }

    const { rating, feedback, criteria } = req.body;

    const review = await Review.create({
      project: req.params.projectId,
      reviewer: req.user.id,
      rating,
      feedback,
      criteria: criteria || {},
      status: 'completed'
    });

    // Update project status to under_review if not already
    if (project.status === 'submitted') {
      project.status = 'under_review';
      await project.save();
    }

    await review.populate('reviewer', 'name email avatar');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a project
// @route   GET /api/reviews/:projectId
// @access  Private
exports.getProjectReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ project: req.params.projectId })
      .populate('reviewer', 'name email avatar department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner)
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    const { rating, feedback, criteria } = req.body;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, feedback, criteria },
      { new: true, runValidators: true }
    ).populate('reviewer', 'name email avatar');

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviewer stats
// @route   GET /api/reviews/stats/overview
// @access  Private (Reviewer, Admin)
exports.getReviewerStats = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'reviewer') {
      query.reviewer = req.user.id;
    }

    const [totalReviews, avgRating, recentReviews] = await Promise.all([
      Review.countDocuments(query),
      Review.aggregate([
        { $match: query },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]),
      Review.find(query)
        .populate('project', 'title category status')
        .populate('reviewer', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalReviews,
        averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avg * 10) / 10 : 0,
        recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
};
