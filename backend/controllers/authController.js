const User = require('../models/User');
const jwt = require('jsonwebtoken');
const memoryDb = require('../utils/memoryDb');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('Server configuration error.');
    error.statusCode = 500;
    throw error;
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile || '',
  college: user.college || '',
  course: user.course || '',
  branch: user.branch || '',
  semester: user.semester || '',
  avatar: user.avatar || '',
  stats: user.stats,
  role: user.role,
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, mobile, password, college, course, branch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (!memoryDb.isDbConnected()) {
      const existingUser = memoryDb.mockUsers.find(u => u.email === email.toLowerCase().trim());
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered. Please login instead.',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = {
        _id: 'user_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile || '',
        password: hashedPassword,
        college: college || '',
        course: course || '',
        branch: branch || '',
        semester: semester || '',
        avatar: '',
        role: 'student',
        stats: {
          resourcesDownloaded: 0,
          videosWatched: 0,
          aiQueries: 0,
          savedResources: 0,
          aiSessions: 0,
        },
        savedResourceIds: [],
        watchLater: [],
        createdAt: new Date(),
      };

      memoryDb.mockUsers.push(newUser);
      const token = generateToken(newUser._id);

      return res.status(201).json({
        success: true,
        message: 'Welcome to Rapid Revision Hub! Your account is ready (Mock Mode).',
        token,
        user: formatUser(newUser),
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered. Please login instead.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile || '',
      password,
      college: college || '',
      course: course || '',
      branch: branch || '',
      semester: semester || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Welcome to Rapid Revision Hub! Your account is ready.',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (!memoryDb.isDbConnected()) {
      const user = memoryDb.mockUsers.find(u => u.email === email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Login successful! Welcome back to Rapid Revision Hub (Mock Mode).',
        token,
        user: formatUser(user),
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful! Welcome back to Rapid Revision Hub.',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: formatUser(req.user) });
};

module.exports = { register, login, getMe };
