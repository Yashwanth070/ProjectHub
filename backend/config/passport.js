const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper to find or create OAuth user
const findOrCreateUser = async (profile, provider) => {
  const email = profile.emails?.[0]?.value;
  
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Link OAuth provider if not already linked
      if (!existingUser[`${provider}Id`]) {
        existingUser[`${provider}Id`] = profile.id;
        if (profile.photos?.[0]?.value) existingUser.avatar = profile.photos[0].value;
        await existingUser.save();
      }
      return existingUser;
    }
  }

  // Create new user
  const user = await User.create({
    name: profile.displayName || profile.username || 'User',
    email: email || `${provider}_${profile.id}@oauth.placeholder`,
    password: crypto.randomBytes(32).toString('hex'),
    [`${provider}Id`]: profile.id,
    avatar: profile.photos?.[0]?.value || '',
    role: 'student'
  });

  return user;
};

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'google');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user:email'],
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'github');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
}

module.exports = passport;
