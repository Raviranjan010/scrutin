const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS_FILE = path.join(__dirname, '../../data/users.json');

const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, '[]');
    return [];
  }
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

module.exports.signUp = async (email, password) => {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    isPro: false,
    usage: {},
    provider: 'local'
  };

  users.push(newUser);
  saveUsers(users);

  return { id: newUser.id, email: newUser.email, isPro: newUser.isPro };
};

module.exports.signIn = async (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user || user.provider !== 'local') {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  
  return { token, user: { id: user.id, email: user.email, isPro: user.isPro, usage: user.usage } };
};

module.exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const users = getUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) throw new Error('User not found');
    return user;
  } catch (e) {
    throw new Error('Invalid token');
  }
};

module.exports.githubCallback = (profile) => {
  const users = getUsers();
  let user = users.find(u => u.githubId === profile.id);

  if (!user) {
    // Also check if email exists from github
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = users.find(u => u.email === email);
    }

    if (!user) {
      user = {
        id: Date.now().toString(),
        githubId: profile.id,
        email: email,
        username: profile.username || profile.displayName,
        isPro: false,
        usage: {},
        provider: 'github'
      };
      users.push(user);
      saveUsers(users);
    } else {
      user.githubId = profile.id;
      saveUsers(users);
    }
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  return { token, user: { id: user.id, email: user.email, isPro: user.isPro, usage: user.usage } };
};

module.exports.updateUserUsage = async (userId) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    if (!user.usage) user.usage = {};
    if (!user.usage[currentMonth]) user.usage[currentMonth] = 0;
    user.usage[currentMonth] += 1;
    saveUsers(users);
  }
};

module.exports.getUserById = (userId) => {
  const users = getUsers();
  return users.find(u => u.id === userId);
};
