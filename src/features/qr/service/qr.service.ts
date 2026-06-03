import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { Counter } from '../model/counter.model.js';
import { Ticket } from '../model/ticket.model.js';

// Helper 1: Generate Sequential ID (e.g., TEDXIITP-26-81-0001)
const generateTicketId = async (): Promise<string> => {
 
  const counter = await Counter.findOneAndUpdate(
    { key: 'ticket_sequence' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true } 
  );

  //pad the number with zeroes (1 becomes 0001)
  const sequenceStr = counter.sequence.toString().padStart(4, '0');
  return `TEDXIITP-26-81-${sequenceStr}`;
};

// generate and save the QR Code
export const generateTicketAndQR = async (userId: string, session: "SESSION_1" | "SESSION_2") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing from .env");

  //get the next available ticket ID
  const ticketId = await generateTicketId();

  
  const payload = {
    ticketId,
    userId,
    session
  };

  // sign the token 
  const qrToken = jwt.sign(payload, secret);

  // generate the actual QR Code image (as a base64 Data URL)
  const qrImageURL = await QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: 'H', // hifh for better scanning
    margin: 2
  });

  // dave the ticket to the database
  const newTicket = await Ticket.create({
    ticketId,
    userId,
    session,
    qrToken, 
    status: "ACTIVE",
    isCheckedIn: false
  });

  return {
    ticketId: newTicket.ticketId,
    qrCode: qrImageURL,
    qrToken: qrToken
  };
};