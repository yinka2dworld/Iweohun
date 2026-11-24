import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * Normalizes legacy books where `listenersList` was stored as an array of
 * arrays ([[userId], [userId]]) into a flat ObjectId array.
 *
 * Safe to run multiple times.
 */
const run = async () => {
  if (!process.env.DBURL) throw new Error('DBURL is not set');

  await mongoose.connect(process.env.DBURL);
  const collection = mongoose.connection.db.collection('books');
  const books = await collection.find({}).toArray();
  let updated = 0;

  for (const book of books) {
    const list = book.listenersList || [];
    const flat = list
      .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
      .filter(Boolean)
      .map((id) => String(id));

    const unique = [...new Set(flat)];
    const alreadyFlat = list.every((entry) => !Array.isArray(entry));
    const countMatches = (book.listenersCount || 0) === unique.length;

    if (alreadyFlat && countMatches) continue;

    await collection.updateOne(
      { _id: book._id },
      {
        $set: {
          listenersList: unique.map((id) => new mongoose.Types.ObjectId(id)),
          listenersCount: unique.length,
        },
      }
    );
    updated += 1;
    console.log(`[migrate] ${book.bookName || book._id}: ${unique.length} listener(s)`);
  }

  console.log(`[migrate] Done. ${updated} book(s) updated.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('[migrate] Failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
