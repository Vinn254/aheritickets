// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });
};

// Public registration: creates customer accounts only
exports.register = async (req, res, next) => {
  try {
  const { name, phone, email, password } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ message: 'Missing required fields' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const user = new User({ name, phone, email, password, role: 'customer' });
  await user.save();

  const token = signToken(user);
  res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

// Protected: get current user info
exports.me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
// Public: request password reset
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found with that email' });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In production, send email with reset link
    // For now, return the token (in production, this should be sent via email)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    // TODO: Send email with resetUrl
    console.log('Password reset link:', resetUrl);

    res.json({
      message: 'Password reset link has been sent to your email',
      // In production, don't return the token; it should only be in the email
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (err) {
    next(err);
  }
};

// Public: reset password with token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password, passwordConfirm } = req.body;
    if (!token || !password || !passwordConfirm) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the token to find the user
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    const loginToken = signToken(user);
    res.json({
      message: 'Password reset successful',
      token: loginToken,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};