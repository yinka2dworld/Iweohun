import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewedBy: { type: String, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Book" }, 
  review: { type: String, required: true },
  parentReview: { type: mongoose.Schema.Types.ObjectId, ref: "Review", default: null },
    },
{ timestamps: true }
  );

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);