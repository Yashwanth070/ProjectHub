const express = require('express');
const {
  getUsers,
  getUser,
  updateProfile,
  updateUserRole,
  deleteUser,
  getAdminStats
} = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

const router = express.Router();

// Admin stats
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);

// Profile
router.put('/profile', protect, updateProfile);

// Admin user management
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, getUser);

router.patch('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
