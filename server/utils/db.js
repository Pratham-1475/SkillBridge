import mongoose from 'mongoose';

export async function connectToDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected to database "${mongoose.connection.name}".`);
}
