import mongoose from "mongoose";
import { Schema } from 'mongoose';

const chapterSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
  },
  progress: {
    type: Number, 
  },
  audioUrl: {
    type: String,
    required: true,
  },
});


const bookSchema = new Schema({
  bookCover: {
    type: String,
    required: true
    // unique:true,
  },
  bookName: {
    type: String,
    required: true,
    // unique: true,
  },
  bookDescription: {
    type: String,
    required: true,
    // unique:true
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
  likes: {
    type: Number,
  },
  chapters: [chapterSchema], 
  listeners: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['History & Biographies', 'Fiction & Romance', 'Kids', 'Personal Development', 'Adventure & Thrillers']
  },
  language: {
    type: String,
    required: true,
  },
},
  { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;
