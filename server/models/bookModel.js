import mongoose from "mongoose";
import { Schema } from 'mongoose';

const chapterSchema = new Schema({
title: {
    type: String,
    required: true,
  },

  duration: {
    type: String,
    required: true,
  },

  progress: {
    type: Number, 
    default: 0, 
  },

  bookAudio: {
      type: String,
      required: true,
    }
});


const bookSchema = new Schema({
  bookCover: {
      type: String,
      required: true,
},

  bookName: {
    type: String,
    required: true,
    unique: true,
  },

  bookDescription: {
    type: String,
    required: true,
  },

  bookAuthor: {
    type: String,
    required: true,
  },

  reciter: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['isCertified', 'notCertified'],
    default: 'notCertified',
    required: true
  },  

  chapters: [chapterSchema], 

  listenersList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  listenersCount: {
    type: Number,
    default: 0,
  },

  category: {
    type: String,
    required: true,
    enum: ['History & Biographies', 'Fiction', 'Non-fiction', 'Kids', 'Personal Development', 'Adventure & Thrillers']
  },

  language: {
    type: String,
    required: true,
    enum: ['Swahili', 'Yoruba', 'Zulu', 'Amharic', 'Hausa', 'Igbo', 'Amazigh', 'Somali', 'Shona', 'Fulani', 'Malagasy', 'Oromo']
  }, 
  
  postedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
       },
},
  { timestamps: true }
);

bookSchema.index({ status: 1, language: 1 });
bookSchema.index({ status: 1, category: 1 });
bookSchema.index({ status: 1, listenersCount: -1 });

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
export default Book;
