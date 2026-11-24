import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB. Throws on failure so the caller can decide whether to
 * exit or retry. A short selection timeout keeps startup failures obvious.
 */
const dbConnecter = async () => {
  if (!process.env.DBURL) {
    throw new Error('DBURL is not set in the environment.');
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('[db] MongoDB reconnected');
  });

  await mongoose.connect(process.env.DBURL, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log('[db] Connected to MongoDB');
  return mongoose.connection;
};

export default dbConnecter;
