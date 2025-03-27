import express from 'express';
import { addBook, getBooks, getBook, updateBook, deleteBook, searchBook } from '../controllers/bookControllers.js';
import {tokenChecker} from '../middleware/auth.js';
 const router = express.Router();



router.post('/admin/addBook', tokenChecker, addBook);
router.get('/books', getBooks);
router.get('/book/:_id', tokenChecker, getBook);
router.put('/admin/updateBook/:_id', tokenChecker, updateBook);
router.delete('/admin/deleteBook/:_id', tokenChecker, deleteBook);
router.get('/searchBar', searchBook);

export default router;