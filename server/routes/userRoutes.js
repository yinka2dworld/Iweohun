import express from 'express';
import { signup, login, updateUser, deleteUser, resetPassword, user, users } from '../controllers/userControllers.js';
import {tokenChecker} from '../middleware/auth.js'
 const router = express.Router();


router.post( '/signup', signup);
router.post( '/login', login);
// app.get('/auth/google', googleAuth);
// app.get('/auth/google/callback', googleAuthCallback);
router.get( '/admin/users', tokenChecker, users);
router.get( '/admin/user/:_id', tokenChecker, user);
router.put( '/admin/updateUser/:_id', tokenChecker, updateUser);
router.delete( '/admin/deleteUser/:_id', tokenChecker, deleteUser);
router.patch( '/resetPassword', resetPassword);

export default router;