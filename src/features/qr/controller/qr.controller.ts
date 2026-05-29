import { Request, Response } from 'express';
import { generateTicketAndQR } from '../service/qr.service.js';
import { validateTicketScan } from '../service/validation.service.js';
import { Ticket } from '../model/ticket.model.js';
import { revokeTicket } from '../service/validation.service.js';
import { getAttendanceStats } from '../service/attendance.service.js';
export const generateTicket = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, session } = req.body;

    // 1. Basic Validation
    if (!userId || !session) {
      return res.status(400).json({ error: "userId and session are required" });
    }

    if (session !== "SESSION_1" && session !== "SESSION_2") {
      return res.status(400).json({ error: "Invalid session type. Must be SESSION_1 or SESSION_2" });
    }
    const validSession = session as "SESSION_1" | "SESSION_2";

    // 2. Call the Service
    const ticketData = await generateTicketAndQR(userId, validSession);

    // 3. Return the Success Response
    return res.status(201).json({
      success: true,
      message: "Secure ticket generated successfully",
      data: ticketData
    });

  } catch (error: any) {
    console.error("QR Generation Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const validateScan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { qrToken, scannedBy } = req.body;

    if (!qrToken || !scannedBy) {
      return res.status(400).json({ error: "qrToken and scannedBy are required" });
    }

    // Call our new validation service
    const result = await validateTicketScan(qrToken, scannedBy);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      // Return a 403 Forbidden for bad scans
      return res.status(403).json(result);
    }

  } catch (error: any) {
    console.error("QR Validation Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};




export const getStats = async (req: Request, res: Response): Promise<any> => {
  try {
    // Call the service function
    const stats = await getAttendanceStats();
    
    return res.status(200).json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
};



export const handleRevoke = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.body;
    const ticket = await revokeTicket(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.status(200).json({ success: true, message: "Ticket revoked" });
  } catch (error) {
    res.status(500).json({ error: "Revocation failed" });
  }
};