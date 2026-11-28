import 'dotenv/config';
import mongoose from 'mongoose';
import Book from '../models/bookModel.js';
import User from '../models/userModel.js';
import Rating from '../models/ratingModel.js';
import Review from '../models/reviewModel.js';

/**
 * Reconciles MongoDB indexes with the Mongoose schemas. Run this after
 * changing `unique` or `index` definitions.
 */
const run = async () => {
  if (!process.env.DBURL) throw new Error('DBURL is not set');

  await mongoose.connect(process.env.DBURL);

  for (const [name, model] of [
    ['books', Book],
    ['users', User],
    ['ratings', Rating],
    ['reviews', Review],
  ]) {
    await model.syncIndexes();
    console.log(`[indexes] ${name} synced`);
  }

  await mongoose.disconnect();
  console.log('[indexes] Done.');
};

run().catch(async (error) => {
  console.error('[indexes] Failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
