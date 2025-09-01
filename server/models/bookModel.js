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
    unique:true
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
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: 'User' 
  }],

  listenersCount: {
    type: Number,
    default: 0,
  },

  category: {
    type: String,
    required: true,
    enum: ['History & Biographies', 'Fiction', 'Romance', 'Kids', 'Personal Development', 'Adventure & Thrillers']
  },

  language: {
    type: String,
    required: true,
    enum: ['Swahili', 'Yoruba', 'Zulu', 'Amharic', 'Hausa', 'Igbo', 'Amazigh', 'Shona', 'Fulani', 'Malagasy', 'Oromo']
  }, 
  
  postedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
       },
},
  { timestamps: true }
);

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
export default Book;
