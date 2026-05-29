import jwt from 'jsonwebtoken';
import { Ticket } from '../model/ticket.model';
import { Attendance } from '../model/attendance.model';

export const validateTicketScan = async (qrToken: string, scannedBy: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");

  let payload: any;

  // 1. Verify the JWT Signature (Protects against forged/fake QR codes)
  try {
    payload = jwt.verify(qrToken, secret);
  } catch (error) {
    await logAttendance("UNKNOWN", "UNKNOWN", scannedBy, "FAILED_INVALID");
    return { success: false, status: "FAILED_INVALID", message: "Invalid or forged QR code." };
  }

  const { ticketId, session } = payload;

  // 2. Find the exact ticket in the database
  const ticket = await Ticket.findOne({ ticketId });

  if (!ticket) {
    await logAttendance(ticketId, session, scannedBy, "FAILED_INVALID");
    return { success: false, status: "FAILED_INVALID", message: "Ticket not found in system." };
  }

  // 3. Check if the ticket was explicitly revoked by an admin
  if (ticket.status === "REVOKED") {
    await logAttendance(ticketId, session, scannedBy, "FAILED_REVOKED");
    return { success: false, status: "FAILED_REVOKED", message: "This ticket has been revoked." };
  }

  // 4. ATOMIC CHECK-IN: Prevent duplicate scans
  // We search for the ticket AND guarantee 'isCheckedIn' is currently false.
  // If it's already true, this query returns null, stopping the duplicate entry dead in its tracks.
  const updatedTicket = await Ticket.findOneAndUpdate(
    { ticketId: ticketId, isCheckedIn: false },
    { 
      $set: { 
        isCheckedIn: true, 
        checkedInAt: new Date(), 
        status: "USED" 
      } 
    },
    { new: true }
  );

  if (!updatedTicket) {
    // If we didn't get a ticket back, it means someone already scanned it!
    await logAttendance(ticketId, session, scannedBy, "FAILED_DUPLICATE");
    return { success: false, status: "FAILED_DUPLICATE", message: "Ticket already used!" };
  }

  // 5. Success! Log the valid entry.
  await logAttendance(ticketId, session, scannedBy, "SUCCESS");
  return { success: true, status: "SUCCESS", message: "Access Granted!", ticket: updatedTicket };
};

// Helper function to keep our audit logs clean
// Helper function to keep our audit logs clean
const logAttendance = async (
  ticketId: string, 
  session: string, 
  scannedBy: string, 
  status: "SUCCESS" | "FAILED_DUPLICATE" | "FAILED_REVOKED" | "FAILED_INVALID"
) => {
  await Attendance.create({
    ticketId,
    session,
    scannedBy,
    validationStatus: status
  });

};

export const revokeTicket = async (ticketId: string) => {
  return await Ticket.findOneAndUpdate(
    { ticketId },
    { status: "REVOKED" },
    { new: true }
  );
};