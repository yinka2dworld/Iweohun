import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;
const ADMIN_ROLES = ['admin', 'superAdmin'];

const isAdmin = (role) => ADMIN_ROLES.includes(role);
const isSelf = (req, id) => String(req.user?._id) === String(id);

const sanitizeUser = (user) => {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.password;
  delete plain.__v;
  return plain;
};

const validateId = (id) => mongoose.isValidObjectId(id);

const devError = (error) =>
  process.env.NODE_ENV === 'production' ? {} : { error: error.message };

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Server authentication is not configured.');
  }

  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

export const signup = async (req, res) => {
  const body = req.body || {};
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const phoneNumber = String(body.phoneNumber || '').trim();

  if (!username) return res.status(400).json({ message: 'Username is required' });
  if (username.length < 3 || username.length > 40 || /\s/.test(username)) {
    return res.status(400).json({
      message: 'Username must be 3-40 characters and cannot contain spaces',
    });
  }
  if (!email) return res.status(400).json({ message: 'Email is required' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
  if (!password) return res.status(400).json({ message: 'Password is required' });
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });
  if (!PHONE_RE.test(phoneNumber)) {
    return res.status(400).json({ message: 'Enter a valid phone number' });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phoneNumber }],
    }).select('email username phoneNumber');

    if (existingUser) {
      const field =
        existingUser.email === email
          ? 'Email'
          : existingUser.username === username
            ? 'Username'
            : 'Phone number';
      return res.status(409).json({ message: `${field} is already registered` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'User signup successful',
      userId: createdUser._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'account';
      return res.status(409).json({ message: `${field} is already registered` });
    }
    console.error('Signup error:', error);
    return res
      .status(500)
      .json({ message: 'Could not create your account. Please try again.', ...devError(error) });
  }
};

export const login = async (req, res) => {
  const body = req.body || {};
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    if (user.activityStatus === 'isSuspended') {
      return res.status(403).json({ message: 'This account has been suspended.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[auth] JWT_SECRET is not configured');
      return res.status(500).json({ message: 'Server authentication is not configured.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      userId: user._id,
      username: user.username,
      role: user.role,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res
      .status(500)
      .json({ message: 'Something went wrong. Please try again later.', ...devError(error) });
  }
};

export const users = async (req, res) => {
  if (!isAdmin(req.user?.role)) {
    return res.status(403).json({ message: 'You are not authorized to access this.' });
  }

  try {
    const usersInfo = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ usersInfo });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res
      .status(500)
      .json({ message: 'Unable to fetch users', ...devError(error) });
  }
};

export const user = async (req, res) => {
  const { _id } = req.params;

  if (!validateId(_id)) return res.status(400).json({ message: 'Invalid user id' });
  if (!isSelf(req, _id) && !isAdmin(req.user?.role)) {
    return res.status(403).json({ message: 'You are not authorized to view this user.' });
  }

  try {
    const userInfo = await User.findById(_id);
    if (!userInfo) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(sanitizeUser(userInfo));
  } catch (error) {
    console.error('Error fetching user:', error);
    return res
      .status(500)
      .json({ message: 'Server error while fetching user', ...devError(error) });
  }
};

export const updateUser = async (req, res) => {
  const { _id } = req.params;
  const body = req.body || {};

  if (!validateId(_id)) return res.status(400).json({ message: 'Invalid user id' });
  if (!isSelf(req, _id) && !isAdmin(req.user?.role)) {
    return res.status(403).json({ message: 'You are not authorized to update this user.' });
  }

  const updates = {};

  if (body.username !== undefined) {
    const username = String(body.username).trim();
    if (username.length < 3 || username.length > 40 || /\s/.test(username)) {
      return res.status(400).json({
        message: 'Username must be 3-40 characters and cannot contain spaces',
      });
    }
    updates.username = username;
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    updates.email = email;
  }

  if (body.phoneNumber !== undefined) {
    const phoneNumber = String(body.phoneNumber).trim();
    if (!PHONE_RE.test(phoneNumber)) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }
    updates.phoneNumber = phoneNumber;
  }

  if (body.fullName !== undefined) updates.fullName = String(body.fullName).trim();
  if (body.profilePhoto !== undefined) updates.profilePhoto = String(body.profilePhoto).trim();
  if (body.country !== undefined) updates.country = String(body.country).trim();
  if (body.preferredLanguage !== undefined) {
    updates.preferredLanguage = String(body.preferredLanguage).trim();
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields were provided to update.' });
  }

  try {
    const uniqueConditions = [
      ...(updates.username ? [{ username: updates.username }] : []),
      ...(updates.email ? [{ email: updates.email }] : []),
      ...(updates.phoneNumber ? [{ phoneNumber: updates.phoneNumber }] : []),
    ];
    const duplicate = uniqueConditions.length
      ? await User.findOne({
          _id: { $ne: _id },
          $or: uniqueConditions,
        }).select('username email phoneNumber')
      : null;

    if (duplicate) {
      const field =
        duplicate.username === updates.username
          ? 'Username'
          : duplicate.email === updates.email
            ? 'Email'
            : 'Phone number';
      return res.status(409).json({ message: `${field} is already in use` });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      message: 'User info updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'value';
      return res.status(409).json({ message: `${field} is already in use` });
    }
    console.error('Error updating user:', error);
    return res
      .status(500)
      .json({ message: 'Unable to update user', ...devError(error) });
  }
};

export const deleteUser = async (req, res) => {
  if (!isAdmin(req.user?.role)) {
    return res.status(403).json({ message: 'You are not authorized to access this.' });
  }

  const { _id } = req.params;
  if (!validateId(_id)) return res.status(400).json({ message: 'Invalid user id' });
  if (isSelf(req, _id)) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }

  try {
    const removedUser = await User.findByIdAndDelete(_id);
    if (!removedUser) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res
      .status(500)
      .json({ message: 'Unable to delete user', ...devError(error) });
  }
};

export const getCreatorPaymentInfo = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('creatorProfile role');
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      role: currentUser.role,
      creatorProfile: currentUser.creatorProfile || null,
    });
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    return res
      .status(500)
      .json({ message: 'Unable to fetch creator details', ...devError(error) });
  }
};

const CREATOR_FIELDS = [
  'country',
  'currency',
  'paymentMethod',
  'accountNumber',
  'bankName',
  'swiftCode',
  'taxId',
];

export const updateCreatorPaymentInfo = async (req, res) => {
  const body = req.body || {};
  const requiredFields = ['country', 'paymentMethod', 'accountNumber'];
  const missing = requiredFields.filter((field) => !String(body[field] || '').trim());

  if (missing.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const profile = {
      ...(currentUser.creatorProfile?.toObject?.() || currentUser.creatorProfile || {}),
      ...Object.fromEntries(
        CREATOR_FIELDS.map((field) => [
          field,
          body[field] !== undefined ? String(body[field]).trim() : undefined,
        ]).filter(([, value]) => value !== undefined)
      ),
      submittedAt: new Date(),
      status: 'active',
    };

    currentUser.creatorProfile = profile;
    if (currentUser.role === 'user') {
      currentUser.role = 'creator';
    }
    await currentUser.save();

    return res.status(200).json({
      message: 'Creator payment information saved successfully',
      role: currentUser.role,
      token: signToken(currentUser),
      user: sanitizeUser(currentUser),
    });
  } catch (error) {
    console.error('Error saving creator payment info:', error);
    return res
      .status(500)
      .json({ message: 'Unable to save creator payment information', ...devError(error) });
  }
};

export const resetPassword = async (req, res) => {
  return res.status(501).json({
    message: 'Password reset is not available yet. Please contact support.',
  });
};
