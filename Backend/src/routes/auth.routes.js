const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { signUp, signIn, githubCallback } = require('../services/auth.service');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Passport GitHub Configuration
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
    callbackURL: process.env.BACKEND_URL 
      ? `${process.env.BACKEND_URL}/auth/github/callback` 
      : 'http://localhost:3000/auth/github/callback'
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const result = await githubCallback(profile);
      return done(null, result);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((userObj, done) => {
  done(null, userObj);
});

passport.deserializeUser((userObj, done) => {
  done(null, userObj);
});

// Local Auth Routes
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const user = await signUp(email, password);
    res.json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await signIn(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// GitHub OAuth Routes
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  function(req, res) {
    // Successful authentication, redirect to frontend with token
    const token = req.user.token;
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?token=${token}`);
  }
);

// Get Current User
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
