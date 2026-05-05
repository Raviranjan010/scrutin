const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production.');
    }
    return 'dev_jwt_secret';
  }
  return secret;
}

function createToken(user) {
  return jwt.sign({ id: user._id }, getJwtSecret(), { expiresIn: '7d' });
}

function serializeUser(user) {
  const usage = user.usage instanceof Map ? Object.fromEntries(user.usage) : (user.usage || {});
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    provider: user.provider,
    isPro: user.isPro,
    usage
  };
}

function getGithubEmail(profile) {
  const primaryEmail = profile.emails && profile.emails.find((email) => email.value)?.value;
  if (primaryEmail) return primaryEmail;

  const username = profile.username || profile.displayName || `github-${profile.id}`;
  return `${username}@users.noreply.github.com`.toLowerCase();
}

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

  return {
    token: createToken(newUser),
    user: serializeUser(newUser)
  };
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

  return { 
    token: createToken(user), 
    user: serializeUser(user)
  };
};

module.exports.verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    return serializeUser(user);
  } catch (e) {
    throw new Error('Invalid token');
  }
};

module.exports.githubCallback = async (profile) => {
  let user = await User.findOne({ githubId: profile.id });

  if (!user) {
    const email = getGithubEmail(profile);
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

  return { 
    token: createToken(user), 
    user: serializeUser(user)
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
