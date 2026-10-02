import mongoose from 'mongoose';

/**
 * Connect to MongoDB with graceful error handling and retry guidance
 */
export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined. Please check backend/.env');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'Enrich'
    });
    console.log(`✅ MongoDB Connected successfully to database [${conn.connection.name}]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Check your MONGODB_URI in backend/.env');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
