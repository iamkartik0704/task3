import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import qrRoutes from './features/qr/routes/qr.routes';

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// db Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env file");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
// Middleware
app.use(cors());
app.use(express.json());

// Route
app.use('/api/qr', qrRoutes);


// Basic Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'QR service is running perfectly' });
});

// Start the Server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`QR Scanner service running on http://localhost:${PORT}`);
});