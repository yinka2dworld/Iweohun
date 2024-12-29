import mongoose from 'mongoose';


mongoose.set("strictQuery", true)
mongoose.Promise=global.Promise

  const dbConnecter = async () => {
  await mongoose.connect(process.env.DBURL)
  try {
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  } 
}
export default dbConnecter;