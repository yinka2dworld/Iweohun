import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
},
{ timestamps: true });

RatingSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
