import express from 'express';
import {
  signup,
  login,
  updateUser,
  deleteUser,
  resetPassword,
  user,
  users,
  getCreatorPaymentInfo,
  updateCreatorPaymentInfo,
} from '../controllers/userControllers.js';
import { tokenChecker } from '../middleware/auth.js';

const router = express.Router();

// Public authentication
router.post('/signup', signup);
router.post('/login', login);

// Account
router.get('/user/:_id', tokenChecker, user);
router.put('/updateUser/:_id', tokenChecker, updateUser);

// Creator payout details
router.get('/creator/payment-info', tokenChecker, getCreatorPaymentInfo);
router.post('/creator/payment-info', tokenChecker, updateCreatorPaymentInfo);
router.put('/creator/payment-info', tokenChecker, updateCreatorPaymentInfo);

// Admin
router.get('/admin/users', tokenChecker, users);
router.delete('/admin/deleteUser/:_id', tokenChecker, deleteUser);

// Not implemented yet (kept for API compatibility)
router.patch('/resetPassword', resetPassword);

export default router;
