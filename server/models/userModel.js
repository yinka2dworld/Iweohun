import mongoose from 'mongoose'
import { Schema } from 'mongoose'


const userSchema = new Schema({ 

  profilePhoto:{
    type: String,
      // unique:true
   },

    fullName: {
      type: String,
      // unique:true
     },

     username: { 
       type: String,
      required: true,
      unique:true
       },

password:{
      type: String,
      required: true
   },
   
    phoneNumber:{
      type: String,
      required: true,
      unique:true 
     },

    email:{
      type: String,
      required: true,
      unique:true
     },

   country:{
    type: String,
    // unique:true
   },

   preferredLanguage:{
      type: String,
      // unique:true
   },
   
     resetToken:{
      type: String,
     },

     resetExp: {
      type: String,
     },

     role:{
      type: String,
       enum: ['admin', 'user', 'superAdmin'],
      default: 'user',
       required: true
     },

     activityStatus: {
      type: String,
      enum: ['isSuspended', 'isPermited'],
      default: 'isPermited',
      required: true
     },

},
{timestamps: true}
);


const User = mongoose.model('User', userSchema);
export default User;