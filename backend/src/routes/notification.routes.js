import { Router } from 'express';
import {
  subscribePush,
  getNotificationStatus,
  sendTestNotification,
  trigger2HourReminderCheck
} from '../controllers/notification.controller.js';

const router = Router();

router.post('/subscribe', subscribePush);
router.get('/status', getNotificationStatus);
router.post('/test', sendTestNotification);
router.post('/check-reminders', trigger2HourReminderCheck);

export default router;
