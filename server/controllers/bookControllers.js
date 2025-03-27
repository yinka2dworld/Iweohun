import Book from "../models/bookModel.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"



export const searchBook = async (req, res) => {
  try {
      const { searchTerm } = req.query;

      // Validate search term
      if (!searchTerm) {
          return res.status(400).json({ message: 'Search term is required.' });
      }

      // Search for books using bookName and bookAuthor
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
          console.error(error)
      }
        res.status(200).json(book)  
    } catch (error) {
        res.status(400).json({message:'Unable to fetch book', error})   
    }
}



export const addBook = async (req, res) => { 
  try {
    // Authorization check: Only 'superAdmin' or 'admin' can add books
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to access this.' });
    }

    const { bookCover, bookName, bookDescription, bookAuthor, audioBook, category, language } = req.body;

    // Upload images/audio only if provided
    const bookCoverUrl = bookCover ? await uploadToCloudinary(bookCover) : null;
    const audioBookUrl = audioBook ? await uploadToCloudinary(audioBook) : null;

    // Create new book entry in the database
    const newBook = await Book.create({
      bookCover: bookCoverUrl,
      bookName,
      bookDescription,
      bookAuthor,
      category,
      language,
      audioBook: audioBookUrl
    });

    if (!newBook) {
      return res.status(500).json({ message: 'Failed to create book' });
    }

    return res.status(201).json({
      message: 'New book added successfully',
      book: newBook
    });

  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Unable to add book', error: error.message });
  }
};



export const updateBook = async (req, res) => {
   if (req.user.role != 'superAdmin' || 'admin') {
              throw new Error('You are not authorized to access this.');    
          }
  const { _id } = req.params;
  const { bookCover, bookName, bookDescription, bookAuthor, audioBook } = req.body;
     try {
    const existingBook = await Book.findById(_id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const bookCoverUrl = bookCover ? await uploadToCloudinary(bookCover) : existingBook.bookCover;
    const audioBookUrl = audioBook ? await uploadToCloudinary(audioBook) : existingBook.audioBook;

    const updatedBook = await Book.findByIdAndUpdate(
      _id,
      {
        bookCover: bookCoverUrl,
        bookName: bookName || existingBook.bookName,
        bookDescription: bookDescription || existingBook.bookDescription,
        bookAuthor: bookAuthor || existingBook.bookAuthor,
        audioBook: audioBookUrl,
      },
      { new: true } 
    );
    res.status(200).json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    res.status(400).json({ message: 'Unable to update book', error: error.message });
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
  