import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from './features/qr/model/admin.model';
dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const admin = await Admin.findOne({ email: 'admin@tedx.com' });
  console.log("--- RAW DATABASE DOCUMENT ---");
  console.log(JSON.stringify(admin, null, 2));
  process.exit();
};
check();