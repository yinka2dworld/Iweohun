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
          status: "isCertified",
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
        const books = await Book.find({ status: "isCertified" }).sort({ createdAt: -1 });
      
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
    const books = await Book.find({ status: "isCertified" })
      .sort({ listenersCount: -1 }) 
      .limit(20); 

    return res.status(200).json({ books });
    
  } catch (error) {
    res.status(400).json({ message: 'Unable to fetch books', error });  
  }
}


export const getBookRatings = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user?.id; // assuming auth middleware sets req.user

  try {
    const ratings = await Rating.find({ bookId });
    const total = ratings.length;
    const avgRating = total === 0 ? 0 : ratings.reduce((sum, r) => sum + r.rating, 0) / total;

    let userRating = null;
    if (userId) {
      const userRated = await Rating.findOne({ bookId, userId });
      userRating = userRated?.rating || 0;
    }

    res.json({ avgRating, total, userRating });
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Failed to fetch rating stats' });
  }
};



export const addBookRatings = async (req, res) => {
  const { userId, bookId, rating } = req.body;

  if (!userId || !bookId || rating === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existing = await Rating.findOne({ userId, bookId });

    if (existing) {
      existing.rating = rating;
      await existing.save({ validateModifiedOnly: true });
    } else {
      await Rating.create({ userId, bookId, rating });
    }

     const ratings = await Rating.find({ bookId });
    const total = ratings.length;
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / total;

    res.status(201).json({
      message: 'Rating submitted successfully.',
      avgRating,
      total,
    });
  } catch (error) {
    console.error('Failed to submit rating:', error);
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
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
   return  console.error('Error adding review:', error.response?.data || error.message);
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
      status: "isCertified",
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
    const books = await Book.find({ language: language, status: "isCertified" }); 
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

    if (!['creator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to access this.' });
    }

    const { bookName, bookDescription, bookAuthor, reciter, category, language } = req.body;

    if (!bookName || !bookAuthor || !category || !language) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const bookCoverFile = req.files.find(f => f.fieldname === 'bookCover');
    const bookCover = bookCoverFile
      ? (await uploadToCloudinary(bookCoverFile)).secureUrl
      : null;

    const chaptersMeta = JSON.parse(req.body.chaptersMeta || '[]');
    const processedChapters = [];

    for (const meta of chaptersMeta) {
      const fileField = `chapterAudio_${meta.index}`;
      const audioFile = req.files.find(f => f.fieldname === fileField);

      const audioUrl = audioFile
        ? (await uploadToCloudinary(audioFile)).secureUrl
        : '';

      processedChapters.push({
        title: meta.title,
        duration: meta.duration,
        progress: meta.progress,
        bookAudio: audioUrl,
      });
    }

    const newBook = await Book.create({
      bookCover,
      bookName,
      bookDescription,
      bookAuthor,
      reciter,
      category,
      language,
      postedBy: req.user._id,
      chapters: processedChapters,
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
     if (!['creator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to access this.' });
    }

    const { bookId } = req.params;

    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let bookCoverUrl = existingBook.bookCover;
    const bookCoverFile = req.files.find(f => f.fieldname === 'bookCover');

    if (bookCoverFile) {
      // if (existingBook.bookCover) {
      //   const publicId = extractPublicId(existingBook.bookCover);
      //   await deleteFromCloudinary(publicId);
      // }
      bookCoverUrl = (await uploadToCloudinary(bookCoverFile)).secureUrl;
    }

    const chaptersMeta = JSON.parse(req.body.chaptersMeta || '[]');
    const processedChapters = [];

    for (const meta of chaptersMeta) {
      const fileField = `chapterAudio_${meta.index}`;
      const audioFile = req.files.find(f => f.fieldname === fileField);

      let audioUrl = meta.existingAudioUrl || '';

      if (audioFile) { 
        // if (meta.existingAudioUrl) {
        //   const publicId = extractPublicId(meta.existingAudioUrl);
        //   await deleteFromCloudinary(publicId);
        // }
        audioUrl = (await uploadToCloudinary(audioFile)).secureUrl;
      }

      processedChapters.push({
        title: meta.title,
        duration: meta.duration,
        progress: meta.progress,
        bookAudio: audioUrl,
      });
    }

    existingBook.bookCover = bookCoverUrl;
    existingBook.bookName = req.body.bookName || existingBook.bookName;
    existingBook.bookDescription = req.body.bookDescription || existingBook.bookDescription;
    existingBook.bookAuthor = req.body.bookAuthor || existingBook.bookAuthor;
    existingBook.reciter = req.body.reciter || existingBook.reciter;
    existingBook.category = req.body.category || existingBook.category;
    existingBook.language = req.body.language || existingBook.language;
    existingBook.chapters = processedChapters.length ? processedChapters : existingBook.chapters;

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
      if (!['superAdmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to access this.' });
    }
     const { _id } = req.params;
    try {
      const book = await Book.findById(_id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
    //  const { bookCover, bookAudio } = book;
    //      try {
    //          if (bookAudio) {
    //          await deleteFromCloudinary(bookAudio);
    //          }
    //      if (bookCover) {
    //          await deleteFromCloudinary(bookCover);
    //         }
    //      } catch (fileError) {
    //         console.error('Error deleting files from Cloudinary:', fileError.message);
    //         return res.status(500).json({ message: 'Error deleting associated files', error: fileError.message });
    //      }
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
  
      if (!book.listenersList.includes(userId)) {
        book.listenersList.push(userId);
        book.listenersCount += 1;
        await book.save({ validateModifiedOnly: true });
      }
  
      return res.status(200).json({ message: 'Listener added', listenersCount: book.listenersCount });
    } catch (error) {
      console.error('Error adding listener:', error);
      return res.status(500).json({ message: 'Error adding listener', error: error.message });
    }
  };
  