const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Standard auth routes
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/me', protect, getMe);

// OAuth status check — tells frontend which providers are available
router.get('/oauth/status', (req, res) => {
  res.json({
    success: true,
    providers: {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
    }
  });
});

// Helper to handle OAuth Success
const handleOAuthSuccess = (user, res) => {
  const token = generateToken(user._id);
  const userStr = JSON.stringify({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    avatar: user.avatar
  });
  res.redirect(`http://localhost:5173/oauth/callback?token=${token}&user=${encodeURIComponent(userStr)}`);
};

// Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed', session: false }),
    (req, res) => handleOAuthSuccess(req.user, res)
  );
} else {
  // Mock Google OAuth
  router.get('/google', (req, res) => res.redirect('/api/auth/google/callback'));
  router.get('/google/callback', async (req, res) => {
    const User = require('../models/User');
    const user = await User.findOne({ email: 'alex@portal.com' }); // Mock default student
    handleOAuthSuccess(user, res);
  });
}

// GitHub OAuth
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
  router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login?error=github_failed', session: false }),
    (req, res) => handleOAuthSuccess(req.user, res)
  );
} else {
  // Mock GitHub OAuth
  router.get('/github', (req, res) => res.redirect('/api/auth/github/callback'));
  router.get('/github/callback', async (req, res) => {
    const User = require('../models/User');
    const user = await User.findOne({ email: 'sarah@portal.com' }); // Mock default reviewer
    handleOAuthSuccess(user, res);
  });
}

module.exports = router;
