const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.signUp = async (email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    password: hashedPassword,
    provider: 'local'
  });

  return { id: newUser._id, email: newUser.email, isPro: newUser.isPro };
};

module.exports.signIn = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || user.provider !== 'local') {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  
  return { 
    token, 
    user: { 
      id: user._id, 
      email: user.email, 
      isPro: user.isPro, 
      usage: Object.fromEntries(user.usage || new Map()) 
    } 
  };
};

module.exports.verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    return user;
  } catch (e) {
    throw new Error('Invalid token');
  }
};

module.exports.githubCallback = async (profile) => {
  let user = await User.findOne({ githubId: profile.id });

  if (!user) {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = await User.create({
        githubId: profile.id,
        email: email,
        username: profile.username || profile.displayName,
        provider: 'github'
      });
    } else {
      user.githubId = profile.id;
      await user.save();
    }
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  return { 
    token, 
    user: { 
      id: user._id, 
      email: user.email, 
      isPro: user.isPro, 
      usage: Object.fromEntries(user.usage || new Map()) 
    } 
  };
};

module.exports.updateUserUsage = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentUsage = user.usage.get(currentMonth) || 0;
    user.usage.set(currentMonth, currentUsage + 1);
    await user.save();
  }
};

module.exports.getUserById = async (userId) => {
  return await User.findById(userId);
};

