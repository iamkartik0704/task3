import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { Counter } from '../model/counter.model.js';
import { Ticket } from '../model/ticket.model.js';

// Helper 1: Generate Sequential ID (e.g., TEDXIITP-26-81-0001)
const generateTicketId = async (): Promise<string> => {
  // We use findOneAndUpdate to ensure atomic updates. 
  // If two people buy a ticket at the EXACT same millisecond, MongoDB ensures they don't get the same ID.
  const counter = await Counter.findOneAndUpdate(
    { key: 'ticket_sequence' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true } // Upsert creates the counter if it doesn't exist yet
  );

  // Pad the number with zeroes (1 becomes 0001)
  const sequenceStr = counter.sequence.toString().padStart(4, '0');
  return `TEDXIITP-26-81-${sequenceStr}`;
};

// Main Function: Generate and Save the QR Code
export const generateTicketAndQR = async (userId: string, session: "SESSION_1" | "SESSION_2") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing from .env");

  // 1. Get the next available ticket ID
  const ticketId = await generateTicketId();

  // 2. Create the payload for the QR code
  // We only put non-sensitive data in the QR code itself
  const payload = {
    ticketId,
    userId,
    session
  };

  // 3. Sign the token (This makes it impossible for someone to forge a fake QR code)
  const qrToken = jwt.sign(payload, secret);

  // 4. Generate the actual QR Code image (as a base64 Data URL)
  const qrImageURL = await QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: 'H', // High error correction so it scans easily even if printed slightly blurry
    margin: 2
  });

  // 5. Save the ticket to the database
  const newTicket = await Ticket.create({
    ticketId,
    userId,
    session,
    qrToken, // Storing this allows us to revoke specific tokens later if needed
    status: "ACTIVE",
    isCheckedIn: false
  });

  return {
    ticketId: newTicket.ticketId,
    qrCode: qrImageURL,
    qrToken: qrToken
  };
};