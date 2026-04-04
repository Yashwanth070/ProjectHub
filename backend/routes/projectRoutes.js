const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateStatus,
  getStats
} = require('../controllers/projectController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

const router = express.Router();

// Stats route (must be before /:id)
router.get('/stats/overview', protect, getStats);

router.route('/')
  .get(protect, getProjects)
  .post(
    protect,
    authorize('student', 'admin'),
    upload.array('files', 5),
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('description').trim().notEmpty().withMessage('Description is required'),
      body('category').notEmpty().withMessage('Category is required')
    ],
    createProject
  );

router.route('/:id')
  .get(protect, getProject)
  .put(protect, upload.array('files', 5), updateProject)
  .delete(protect, deleteProject);

router.patch('/:id/status', protect, authorize('reviewer', 'admin'), updateStatus);

module.exports = router;
