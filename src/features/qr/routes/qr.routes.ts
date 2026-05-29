import { Router } from 'express';
import { generateTicket } from '../controller/qr.controller';
import { validateScan } from '../controller/qr.controller';

import { getStats, handleRevoke } from '../controller/qr.controller';

const router = Router();
// Admin Only Routes
router.get('/admin/attendance', getStats);
router.patch('/admin/ticket/revoke', handleRevoke);

// Endpoint: POST /api/qr/generate
router.post('/generate', generateTicket);

router.post('/validate', validateScan);
export default router;