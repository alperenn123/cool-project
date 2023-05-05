import mongoose from 'mongoose';

// Define the connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/app-db';

export async function connectToDb() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');
}
