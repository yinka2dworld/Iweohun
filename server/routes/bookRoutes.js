import express from 'express';
import multer from 'multer';
import {
  addBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  searchBook,
  getLanguageBooks,
  getRelatedBooks,
  addBookRatings,
  getBookRatings,
  addReview,
  getReviews,
  topChart,
  addListener,
} from '../controllers/bookControllers.js';
import { tokenChecker } from '../middleware/auth.js';

const router = express.Router();

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB per file
const MAX_FILES = 60;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    const allowed = file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('audio/');
    if (!allowed) {
      const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
      error.message = 'Only image and audio files are allowed.';
      return cb(error);
    }
    return cb(null, true);
  },
});

// Books
router.get('/books', tokenChecker, getBooks);
router.get('/books/:language', tokenChecker, getLanguageBooks);
router.get('/book/:_id', tokenChecker, getBook);
router.post('/addBook', tokenChecker, upload.any(), addBook);
router.put('/updateBook/:bookId', tokenChecker, upload.any(), updateBook);
router.delete('/deleteBook/:_id', tokenChecker, deleteBook);
router.get('/searchBar', searchBook);

// Discovery / engagement
router.get('/topChart', tokenChecker, topChart);
router.get('/relatedBooks/:bookId', tokenChecker, getRelatedBooks);
router.post('/addListener/:bookId', tokenChecker, addListener);

// Ratings
router.get('/getRatings/:bookId', tokenChecker, getBookRatings);
router.post('/addRatings', tokenChecker, addBookRatings);

// Reviews
router.get('/bookReviews/:bookId', tokenChecker, getReviews);
router.post('/addReview', tokenChecker, addReview);

export default router;
