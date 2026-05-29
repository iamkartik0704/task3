import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import qrRoutes from './features/qr/routes/qr.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env file");
    }
    
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
// Middleware
app.use(cors());
app.use(express.json());

// Routes 👇 Add this line
app.use('/api/qr', qrRoutes);


// Basic Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'QR Microservice is running perfectly!' });
});

// Start the Server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 QR Scanner Microservice running on http://localhost:${PORT}`);
});