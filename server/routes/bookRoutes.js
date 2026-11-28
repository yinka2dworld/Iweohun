import express from 'express';
import { addBook, getBooks, getBook, updateBook, deleteBook, searchBook, getLanguageBooks, getRelatedBooks,
addBookRatings, getBookRatings, addReview, getReviews, topChart, addListener } from '../controllers/bookControllers.js';
import {tokenChecker} from '../middleware/auth.js';
 const router = express.Router();
 import multer from 'multer';

const storage = multer.memoryStorage(); 
export const upload = multer({ storage });



router.post('/addBook', tokenChecker, upload.any(), addBook);
router.get('/books', tokenChecker, getBooks);
router.get('/books/:language', tokenChecker, getLanguageBooks);
router.get('/getRatings/:bookId', tokenChecker, getBookRatings);
router.post('/addRatings', tokenChecker, addBookRatings);
router.get('/bookReviews/:bookId', tokenChecker, getReviews);
router.post('/addReview', tokenChecker, addReview);
router.get('/topChart', tokenChecker, topChart);
router.get('/relatedBooks/:bookId', tokenChecker, getRelatedBooks);
router.get('/book/:_id', tokenChecker, getBook);
router.put('/updateBook/:bookId', tokenChecker, upload.any(), updateBook);
router.delete('/deleteBook/:_id', tokenChecker, deleteBook);
router.get('/searchBar', searchBook);
router.post('/addListener/:bookId', tokenChecker, addListener);



export default router;