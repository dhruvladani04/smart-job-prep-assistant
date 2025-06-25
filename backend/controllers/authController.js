const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate JWT
    const payload = {
      user: {
        id: user._id.toString()
      }
    };

    console.log('Creating JWT with payload:', payload);

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          throw err;
        }
        console.log('JWT token generated successfully');
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found, comparing password...');
    
    // Check password
    let isMatch;
    try {
      isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
    } catch (err) {
      console.error('Error comparing passwords:', err);
      return res.status(500).json({ message: 'Error authenticating user' });
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user._id.toString()
      }
    };

    console.log('Creating login JWT with payload:', payload);

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) {
          console.error('Login JWT sign error:', err);
          throw err;
        }
        console.log('Login JWT token generated successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    console.log('getMe - req.user:', req.user);
    if (!req.user || !req.user.id) {
      console.error('No user in request or missing user ID');
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.error('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error in getMe:', err);
    res.status(500).send('Server Error');
  }
};
