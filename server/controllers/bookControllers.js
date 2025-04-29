import Book from "../models/bookModel.js"
import Review from "../models/reviewModel.js";
import Rating from "../models/ratingModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"



export const searchBook = async (req, res) => {
  try {
      const { searchTerm } = req.query;
      if (!searchTerm) {
          return res.status(400).json({ message: 'Search term is required.' });
      }
      const books = await Book.find({
          $or: [
              { bookName: { $regex: searchTerm, $options: 'i' } },
              { bookAuthor: { $regex: searchTerm, $options: 'i' } },
          ],
      }).select('bookName bookAuthor bookCover'); // Return only relevant fields

      return res.status(200).json({ books });
  } catch (error) {
      console.error('Search API Error:', error);
      return res.status(500).json({ message: 'Something went wrong. Please try again.', error: error.message });
  }
};


export const getBooks = async (req, res) => { 
    try {
        const books = await Book.find().sort({ createdAt: -1 });
      
       return  res.status(200).json({ books }); 
    } catch (error) {
      res.status(400).json({message:'Unable to fetch books', error})  
    }
}


export const getBook = async (req, res) => {
  const { _id } = req.params
  try {
      const book = await Book.findById(_id)
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
      res.status(200).json(book)  
  } catch (error) {
      res.status(400).json({message:'Unable to fetch book', error})   
  }
}


export const topChart = async (req, res) => { 
  try {
    const books = await Book.find()
      .sort({ listeners: -1 }) 
      .limit(20); 

    return res.status(200).json({ books });
    
  } catch (error) {
    res.status(400).json({ message: 'Unable to fetch books', error });  
  }
}


export const getBookRatings = async (req, res) => {
  const { bookId } = req.params;

  try {
    const ratings = await Rating.find({ bookId });
    const total = ratings.length;
    const avgRating = total === 0
      ? 0
      : ratings.reduce((sum, r) => sum + r.rating, 0) / total;
      
    const userRating = await Rating.findOne({ userId: req.userId, bookId });

    res.json({
      avgRating,
      total,
      userRating: userRating || null, 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rating stats' });
  }
};


export const addBookRatings = async (req, res) => {
  const { userId, bookId, rating } = req.body;

  try {
    // Check if the user has already rated the book
    const existing = await Rating.findOne({ userId, bookId });
    if (existing) {
      return res.status(400).json({ message: 'You have already rated this book.' });
    }

    const newRating = new Rating({ userId, bookId, rating });
    await newRating.save();

    // Optionally return the new rating object or updated stats
    res.status(201).json({ message: 'Rating submitted successfully.', rating: newRating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error });
  }
};


export const getReviews = async (req, res) => {
  const { bookId } = req.params;
  try {
    const reviews = await Review.find({ bookId })
      .sort({ createdAt: -1 })
      .lean();

    const nestReviews = (reviewList, parentId = null) => {
      return reviewList
        .filter(review => String(review.parentReview) === String(parentId))
        .map(review => ({
          ...review,
          replies: nestReviews(reviewList, review._id),
        }));
    };

    const structuredReviews = nestReviews(reviews);

    return res.status(200).json(structuredReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};


export const addReview = async (req, res) => {
  try {
    const { bookId, reviewedBy, userId, review, parentReview } = req.body;

    const newReview = await Review.create({
      bookId,
      reviewedBy,
      userId,
      review,
      parentReview: parentReview || null,
    });

    return res.status(201).json(newReview);
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(400).json({ message: 'Unable to add review', error: error.message });
  }
};



export const getRelatedBooks = async (req, res) => {
  const { bookId } = req.params;
  try {
    const mainBook = await Book.findById(bookId);
    if (!mainBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const relatedBooks = await Book.find({
      _id: { $ne: bookId }, 
      $or: [
        { author: mainBook.author },
        { category: mainBook.category }
      ]
    })
    .limit(10); 
    return res.status(200).json({ relatedBooks });
  } catch (error) {
    res.status(400).json({ message: 'Unable to fetch related books', error: error.message  });
  }
};


export const getLanguageBooks = async (req, res) => {
  const { language } = req.params;
  try {
    if (!language) {
      return res.status(400).json({ message: 'No language specified' });
    }
    const books = await Book.find({ language: language }); 
    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found for the specified language' });
    }
    return res.status(200).json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch books by language', error: error.message });
  }
};


export const addBook = async (req, res) => {
  try {
    if (!['superAdmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to access this.' });
    }

    const {
      bookCover,
      bookName,
      bookDescription,
      bookAuthor,
      reciter,
      category,
      language,
      chapters = []
    } = req.body;

    if (!bookName || !bookAuthor || !category || !language) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const bookCoverUrl = bookCover ? await uploadToCloudinary(bookCover) : null;

    const processedChapters = await Promise.all(
      chapters.map(async (chapter) => ({
        id: chapter.id || `chap-${Date.now()}`,
        title: chapter.title,
        duration: chapter.duration || '',
        progress: chapter.progress || 0,
        audioUrl: chapter.audioUrl ? await uploadToCloudinary(chapter.audioUrl) : ''
      }))
    );

    const newBook = await Book.create({
      bookCover: bookCoverUrl,
      bookName,
      bookDescription,
      bookAuthor,
      reciter,
      category,
      language,
      chapters: processedChapters
    });

    return res.status(201).json({
      message: 'New book added successfully',
      book: newBook,
    });
  } catch (error) {
    console.error('Error adding book:', error);
    return res.status(500).json({ message: 'Unable to add book', error: error.message });
  }
};


export const updateBook = async (req, res) => {
  try {
    if (!['superAdmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to access this.' });
    }

    const { bookId } = req.params;
    const {
      bookCover,
      bookName,
      bookDescription,
      bookAuthor,
      reciter,
      category,
      language,
      chapters = []
    } = req.body;

    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const bookCoverUrl = bookCover ? await uploadToCloudinary(bookCover) : existingBook.bookCover;

    const processedChapters = await Promise.all(
      chapters.map(async (chapter) => ({
        id: chapter.id || `chap-${Date.now()}`,
        title: chapter.title || '',
        duration: chapter.duration || '',
        progress: chapter.progress || 0,
        audioUrl: chapter.audioUrl
          ? await uploadToCloudinary(chapter.audioUrl)
          : chapter.existingAudioUrl || ''
      }))
    );

    existingBook.bookCover = bookCoverUrl;
    existingBook.bookName = bookName || existingBook.bookName;
    existingBook.bookDescription = bookDescription || existingBook.bookDescription;
    existingBook.bookAuthor = bookAuthor || existingBook.bookAuthor;
    existingBook.reciter = reciter || existingBook.reciter;
    existingBook.category = category || existingBook.category;
    existingBook.language = language || existingBook.language;
    existingBook.chapters = chapters.length ? processedChapters : existingBook.chapters;

    const updatedBook = await existingBook.save();

    return res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({ message: 'Unable to update book', error: error.message });
  }
};


export const deleteBook = async (req, res) => {
   if (req.user.role != 'superAdmin' || 'admin') {
              throw new Error('You are not authorized to access this.');    
          }
     const { _id } = req.params;
    try {
      const book = await Book.findById(_id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
     const { bookCover, audioBook } = book;
         try {
             if (audioBook) {
             await deleteFromCloudinary(audioBook);
             }
         if (bookCover) {
             await deleteFromCloudinary(bookCover);
            }
         } catch (fileError) {
            console.error('Error deleting files from Cloudinary:', fileError.message);
            return res.status(500).json({ message: 'Error deleting associated files', error: fileError.message });
         }
      await Book.findByIdAndDelete(_id);
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error.message);
      res.status(500).json({ message: 'Failed to delete book', error: error.message });
    }
  };


  export const addListener = async (req, res) => {
    try {
      const { bookId } = req.params;
      const { userId } = req.body; // this comes from client (already stored in SecureStore)
  
      const book = await Book.findById(bookId);
  
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      if (!book.listeners.includes(userId)) {
        book.listeners.push(userId);
        book.listenersCount += 1;
        await book.save();
      }
  
      return res.status(200).json({ message: 'Listener added', listenersCount: book.listenersCount });
    } catch (error) {
      console.error('Error adding listener:', error);
      return res.status(500).json({ message: 'Error adding listener', error: error.message });
    }
  };
  