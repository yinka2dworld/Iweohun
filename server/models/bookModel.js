import mongoose from "mongoose";
import { Schema } from 'mongoose';



const bookSchema = Schema( {

   bookCover:{
    type: String,
    // required: true,
    // unique:true,
     },
     
     bookName:{
      type: String,
      required: true,
      unique:true,
     }, 
     
     bookDescription:{
      type: String,
      required: true,
      // unique:true,
     },

     bookAuthor:{
      type: String,
      required: true,
     },

     audioBook:{
      type: String,
      // required: true,
      // unique:true,
     },

     status:{
      type: String,
      enum: ['isCertified', 'notCertified'],
     default: 'notCertified',
      required: true
    },

    likes:{
     type: Number,
    },

  },
  {timestamps:true}
  )
    
  const Book= mongoose.model('Book', bookSchema)
  export default Book;
