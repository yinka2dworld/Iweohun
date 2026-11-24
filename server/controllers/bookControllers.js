import mongoose from 'mongoose';
import Book from '../models/bookModel.js';
import Review from '../models/reviewModel.js';
import Rating from '../models/ratingModel.js';
import User from '../models/userModel.js';
import { uploadFile, deleteFile } from '../config/cloudinary.js';

const ADMIN_ROLES = ['admin', 'superAdmin'];
const BOOK_MANAGER_ROLES = ['creator', 'admin', 'superAdmin'];

const isAdmin = (role) => ADMIN_ROLES.includes(role);
const canManageBooks = (role) => BOOK_MANAGER_ROLES.includes(role);
const isValidId = (id) => mongoose.isValidObjectId(id);

const devError = (error) =>
  process.env.NODE_ENV === 'production' ? {} : { error: error.message };

const parseChaptersMeta = (raw) => {
  if (raw === undefined || raw === null || raw === '') return null;
  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    const error = new Error('chaptersMeta is not valid JSON');
    error.status = 400;
    throw error;
  }
  if (!Array.isArray(parsed)) {
    const error = new Error('chaptersMeta must be a JSON array');
    error.status = 400;
    throw error;
  }
  return parsed;
};

const getFiles = (req) => (Array.isArray(req.files) ? req.files : []);

const findFile = (files, fieldname) => files.find((file) => file.fieldname === fieldname);

const normalizeListeners = (list) =>
  (list || [])
    .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
    .map((id) => String(id));

/* -------------------------------------------------------------------------- */
/*                                   Search                                   */
/* -------------------------------------------------------------------------- */

export const searchBook = async (req, res) => {
  const searchTerm = String(req.query.searchTerm || '').trim();
  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required.' });
  }

  try {
    const books = await Book.find({
      status: 'isCertified',
      $or: [
        { bookName: { $regex: searchTerm, $options: 'i' } },
        { bookAuthor: { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .select('bookName bookAuthor bookCover')
      .limit(30);

    return res.status(200).json({ books });
  } catch (error) {
    console.error('Search API Error:', error);
    return res
      .status(500)
      .json({ message: 'Something went wrong. Please try again.', ...devError(error) });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   Books                                    */
/* -------------------------------------------------------------------------- */

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'isCertified' }).sort({ createdAt: -1 });
    return res.status(200).json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({ message: 'Unable to fetch books', ...devError(error) });
  }
};

export const getBook = async (req, res) => {
  const { _id } = req.params;
  if (!isValidId(_id)) return res.status(400).json({ message: 'Invalid book id' });

  try {
    const book = await Book.findById(_id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return res.status(500).json({ message: 'Unable to fetch book', ...devError(error) });
  }
};

export const topChart = async (req, res) => {
  try {
    const books = await Book.find({ status: 'isCertified' })
      .sort({ listenersCount: -1, createdAt: -1 })
      .limit(20);

    return res.status(200).json({ books });
  } catch (error) {
    console.error('Error fetching top chart:', error);
    return res.status(500).json({ message: 'Unable to fetch top chart', ...devError(error) });
  }
};

export const getLanguageBooks = async (req, res) => {
  const { language } = req.params;
  if (!language) return res.status(400).json({ message: 'No language specified' });

  try {
    const books = await Book.find({ language, status: 'isCertified' }).sort({ createdAt: -1 });
    return res.status(200).json({ books });
  } catch (error) {
    console.error('Error fetching language books:', error);
    return res
      .status(500)
      .json({ message: 'Unable to fetch books by language', ...devError(error) });
  }
};

export const getRelatedBooks = async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'Invalid book id' });

  try {
    const mainBook = await Book.findById(bookId);
    if (!mainBook) return res.status(404).json({ message: 'Book not found' });

    const relatedBooks = await Book.find({
      _id: { $ne: bookId },
      status: 'isCertified',
      $or: [{ bookAuthor: mainBook.bookAuthor }, { category: mainBook.category }],
    }).limit(10);

    return res.status(200).json({ relatedBooks });
  } catch (error) {
    console.error('Error fetching related books:', error);
    return res
      .status(500)
      .json({ message: 'Unable to fetch related books', ...devError(error) });
  }
};

export const addBook = async (req, res) => {
  if (!canManageBooks(req.user?.role)) {
    return res.status(403).json({ message: 'You are not authorized to add books.' });
  }

  try {
    const { bookName, bookDescription, bookAuthor, reciter, category, language } = req.body;
    const requiredFields = { bookName, bookDescription, bookAuthor, reciter, category, language };
    const missing = Object.entries(requiredFields)
      .filter(([, value]) => !String(value || '').trim())
      .map(([field]) => field);

    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    const files = getFiles(req);
    const bookCoverFile = findFile(files, 'bookCover');
    if (!bookCoverFile) {
      return res.status(400).json({ message: 'A book cover image is required.' });
    }

    const chaptersMeta = parseChaptersMeta(req.body.chaptersMeta) || [];
    if (chaptersMeta.length === 0) {
      return res.status(400).json({ message: 'At least one chapter is required.' });
    }

    // Validate every chapter before uploading anything, so a bad request does
    // not leave orphaned files behind.
    const chaptersToUpload = [];
    for (const meta of chaptersMeta) {
      const index = Number(meta.index);
      if (!String(meta.title || '').trim() || !Number.isFinite(index)) {
        return res.status(400).json({ message: 'Every chapter needs a title and index.' });
      }

      const audioFile = findFile(files, `chapterAudio_${index}`);
      if (!audioFile) {
        return res
          .status(400)
          .json({ message: `Audio file is missing for chapter "${meta.title}".` });
      }

      chaptersToUpload.push({ meta, index, audioFile });
    }

    const bookCover = (await uploadFile(bookCoverFile, req)).secureUrl;
    const processedChapters = [];

    for (const { meta, audioFile } of chaptersToUpload) {
      const { secureUrl } = await uploadFile(audioFile, req);
      processedChapters.push({
        title: String(meta.title).trim(),
        duration: String(meta.duration || '00:00'),
        progress: Number(meta.progress) || 0,
        bookAudio: secureUrl,
      });
    }

    const newBook = await Book.create({
      bookCover,
      bookName: String(bookName).trim(),
      bookDescription: String(bookDescription).trim(),
      bookAuthor: String(bookAuthor).trim(),
      reciter: String(reciter).trim(),
      category,
      language,
      chapters: processedChapters,
      postedBy: req.user._id,
    });

    return res.status(201).json({
      message: 'New book added successfully',
      book: newBook,
    });
  } catch (error) {
    console.error('Error adding book:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A book with that name already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(error.errors || {})
          .map((item) => item.message)
          .join(', '),
      });
    }
    return res
      .status(error.status || 500)
      .json({ message: error.status ? error.message : 'Unable to add book', ...devError(error) });
  }
};

export const updateBook = async (req, res) => {
  if (!canManageBooks(req.user?.role)) {
    return res.status(403).json({ message: 'You are not authorized to update books.' });
  }

  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'Invalid book id' });

  try {
    const existingBook = await Book.findById(bookId);
    if (!existingBook) return res.status(404).json({ message: 'Book not found' });

    if (!isAdmin(req.user.role) && String(existingBook.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit books you created.' });
    }

    const files = getFiles(req);
    const bookCoverFile = findFile(files, 'bookCover');
    let bookCoverUrl = existingBook.bookCover;

    if (bookCoverFile) {
      bookCoverUrl = (await uploadFile(bookCoverFile, req)).secureUrl;
    }

    if (req.body.bookName !== undefined) existingBook.bookName = String(req.body.bookName).trim();
    if (req.body.bookDescription !== undefined) {
      existingBook.bookDescription = String(req.body.bookDescription).trim();
    }
    if (req.body.bookAuthor !== undefined) {
      existingBook.bookAuthor = String(req.body.bookAuthor).trim();
    }
    if (req.body.reciter !== undefined) existingBook.reciter = String(req.body.reciter).trim();
    if (req.body.category !== undefined) existingBook.category = req.body.category;
    if (req.body.language !== undefined) existingBook.language = req.body.language;
    if (bookCoverFile) existingBook.bookCover = bookCoverUrl;

    const chaptersMeta = parseChaptersMeta(req.body.chaptersMeta);
    if (chaptersMeta !== null) {
      const processedChapters = [];

      for (const meta of chaptersMeta) {
        const index = Number(meta.index);
        if (!String(meta.title || '').trim() || !Number.isFinite(index)) {
          return res.status(400).json({ message: 'Every chapter needs a title and index.' });
        }

        const audioFile = findFile(files, `chapterAudio_${index}`);
        let audioUrl = String(meta.existingAudioUrl || '').trim();

        if (audioFile) {
          audioUrl = (await uploadFile(audioFile, req)).secureUrl;
        }

        if (!audioUrl) {
          return res
            .status(400)
            .json({ message: `Audio file is missing for chapter "${meta.title}".` });
        }

        processedChapters.push({
          title: String(meta.title).trim(),
          duration: String(meta.duration || '00:00'),
          progress: Number(meta.progress) || 0,
          bookAudio: audioUrl,
        });
      }

      existingBook.chapters = processedChapters;
    }

    const updatedBook = await existingBook.save();
    return res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    console.error('Error updating book:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A book with that name already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(error.errors || {})
          .map((item) => item.message)
          .join(', '),
      });
    }
    return res
      .status(error.status || 500)
      .json({
        message: error.status ? error.message : 'Unable to update book',
        ...devError(error),
      });
  }
};

export const deleteBook = async (req, res) => {
  if (!isAdmin(req.user?.role)) {
    return res.status(403).json({ message: 'You are not authorized to delete books.' });
  }

  const { _id } = req.params;
  if (!isValidId(_id)) return res.status(400).json({ message: 'Invalid book id' });

  try {
    const book = await Book.findById(_id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Best-effort cleanup of locally stored files.
    const filesToDelete = [book.bookCover, ...(book.chapters || []).map((chapter) => chapter.bookAudio)];
    await Promise.all(
      filesToDelete.filter(Boolean).map((file) =>
        deleteFile(file).catch((error) => console.warn('[cleanup] file delete failed:', error.message))
      )
    );

    await Book.findByIdAndDelete(_id);
    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({ message: 'Failed to delete book', ...devError(error) });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Ratings & reviews                             */
/* -------------------------------------------------------------------------- */

export const getBookRatings = async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'Invalid book id' });

  try {
    const ratings = await Rating.find({ bookId });
    const total = ratings.length;
    const avgRating = total === 0 ? 0 : ratings.reduce((sum, item) => sum + item.rating, 0) / total;
    const userRated = await Rating.findOne({ bookId, userId: req.user._id });

    return res.status(200).json({
      avgRating,
      total,
      userRating: userRated?.rating || 0,
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return res.status(500).json({ message: 'Failed to fetch rating stats', ...devError(error) });
  }
};

export const addBookRatings = async (req, res) => {
  const { bookId } = req.body || {};
  const rating = Number(req.body?.rating);

  if (!isValidId(bookId)) return res.status(400).json({ message: 'Invalid book id' });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5.' });
  }

  try {
    const bookExists = await Book.exists({ _id: bookId });
    if (!bookExists) return res.status(404).json({ message: 'Book not found' });

    const existing = await Rating.findOne({ userId: req.user._id, bookId });
    if (existing) {
      existing.rating = rating;
      await existing.save({ validateModifiedOnly: true });
    } else {
      await Rating.create({ userId: req.user._id, bookId, rating });
    }

    const ratings = await Rating.find({ bookId });
    const total = ratings.length;
    const avgRating = total === 0 ? 0 : ratings.reduce((sum, item) => sum + item.rating, 0) / total;

    return res.status(201).json({
      message: 'Rating submitted successfully.',
      avgRating,
      total,
      userRating: rating,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already rated this book.' });
    }
    console.error('Failed to submit rating:', error);
    return res.status(500).json({ message: 'Failed to submit rating', ...devError(error) });
  }
};

export const getReviews = async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'Invalid book id' });

  try {
    const reviews = await Review.find({ bookId }).sort({ createdAt: -1 }).lean();

    const nestReviews = (reviewList, parentId = null) =>
      reviewList
        .filter((review) => String(review.parentReview || null) === String(parentId))
        .map((review) => ({
          ...review,
          replies: nestReviews(reviewList, review._id),
        }));

    return res.status(200).json(nestReviews(reviews));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Error fetching reviews', ...devError(error) });
  }
};

export const addReview = async (req, res) => {
  const { bookId, review, parentReview } = req.body || {};
  const text = String(review || '').trim();

  if (!isValidId(bookId)) return res.status(400).json({ message: 'Invalid book id' });
  if (!text) return res.status(400).json({ message: 'Review text is required.' });
  if (text.length > 2000) {
    return res.status(400).json({ message: 'Review is too long (max 2000 characters).' });
  }

  try {
    const [bookExists, user] = await Promise.all([
      Book.exists({ _id: bookId }),
      User.findById(req.user._id).select('username'),
    ]);

    if (!bookExists) return res.status(404).json({ message: 'Book not found' });
    if (!user) return res.status(401).json({ message: 'Authentication required.' });

    let parentId = null;
    if (parentReview) {
      if (!isValidId(parentReview)) {
        return res.status(400).json({ message: 'Invalid parent review id' });
      }
      const parent = await Review.findOne({ _id: parentReview, bookId });
      if (!parent) {
        return res.status(400).json({ message: 'The review you are replying to was not found.' });
      }
      parentId = parent._id;
    }

    const newReview = await Review.create({
      bookId,
      reviewedBy: user.username,
      userId: req.user._id,
      review: text,
      parentReview: parentId,
    });

    return res.status(201).json(newReview);
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ message: 'Error adding review', ...devError(error) });
  }
};

/* -------------------------------------------------------------------------- */
/*                                  Listeners                                 */
/* -------------------------------------------------------------------------- */

export const addListener = async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ message: 'Invalid book id' });

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const listeners = [...new Set(normalizeListeners(book.listenersList))];
    const userId = String(req.user._id);

    if (!listeners.includes(userId)) {
      listeners.push(userId);
    }

    book.listenersList = listeners;
    book.listenersCount = listeners.length;
    await book.save();

    return res.status(200).json({
      message: 'Listener added',
      listenersCount: book.listenersCount,
    });
  } catch (error) {
    console.error('Error adding listener:', error);
    return res.status(500).json({ message: 'Error adding listener', ...devError(error) });
  }
};
