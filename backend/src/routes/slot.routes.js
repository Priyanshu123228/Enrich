import { Router } from 'express';
import { queryAvailableSlots } from '../controllers/slot.controller.js';

const router = Router();

// Public endpoint for live time-slot calculation
router.get('/available', queryAvailableSlots);

export default router;
