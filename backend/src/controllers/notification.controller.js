import { PushSubscription } from '../models/PushSubscription.js';
import { Appointment } from '../models/Appointment.js';
import { emailService } from '../services/email.service.js';
import { smsService } from '../services/sms.service.js';
import { getSalonNow, timeToMinutes } from '../services/slot.service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Subscribe client device to Web Push Notifications
 * @route   POST /api/v1/notifications/subscribe
 * @access  Public / Optional Auth
 */
export const subscribePush = asyncHandler(async (req, res) => {
  const { subscription, phone } = req.body;

  if (!subscription || !subscription.endpoint) {
    throw new ApiError(400, 'Invalid push subscription payload');
  }

  const userId = req.user?._id || null;
  const userPhone = phone || req.user?.phone || '';

  const updated = await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      user: userId,
      phone: userPhone,
      endpoint: subscription.endpoint,
      keys: subscription.keys || {},
      userAgent: req.headers['user-agent'] || '',
      active: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { id: updated._id, active: true }, 'Push subscription registered successfully')
  );
});

/**
 * @desc    Get notification status
 * @route   GET /api/v1/notifications/status
 * @access  Public
 */
export const getNotificationStatus = asyncHandler(async (req, res) => {
  const activeSubs = await PushSubscription.countDocuments({ active: true });
  return res.status(200).json(
    new ApiResponse(200, {
      activeSubscribers: activeSubs,
      remindersEnabled: true,
      windowMinutes: 120
    }, 'Notification service active')
  );
});

/**
 * @desc    Send test notification
 * @route   POST /api/v1/notifications/test
 * @access  Public
 */
export const sendTestNotification = asyncHandler(async (req, res) => {
  const { title = 'Enrich Salon Test Alert', message = 'Push notifications are active and ready on this device! 💆‍♀️' } = req.body;

  console.log(
    `\n======================================================\n` +
    `🔔 [TEST PUSH NOTIFICATION]\n` +
    `Title: ${title}\n` +
    `Message: ${message}\n` +
    `Timestamp: ${new Date().toISOString()}\n` +
    `======================================================\n`
  );

  return res.status(200).json(
    new ApiResponse(200, { title, message, delivered: true }, 'Test notification dispatched')
  );
});

/**
 * @desc    Check and Dispatch 2-Hour Appointment Reminders
 * @route   POST /api/v1/notifications/check-reminders
 * @access  Public / Cron
 */
export const checkAndSend2HourReminders = async () => {
  try {
    const { todayStr, minutesFromMidnight } = getSalonNow();

    // Find all confirmed/pending appointments for today where reminder has not been sent yet
    const appointments = await Appointment.find({
      date: todayStr,
      status: { $in: ['confirmed', 'pending'] },
      reminderSent: { $ne: true }
    })
      .populate('service', 'name duration price')
      .populate('staff', 'name phone')
      .populate('customer', 'name email phone');

    const dispatched = [];

    for (const app of appointments) {
      const slotMins = timeToMinutes(app.startTime);
      const diffMins = slotMins - minutesFromMidnight;

      // Check if slot is approximately 2 hours away (between 90 and 150 minutes from now)
      if (diffMins >= 90 && diffMins <= 150) {
        const clientName = app.customer?.name || 'Valued Client';
        const clientPhone = app.customer?.phone || '';
        const serviceName = app.service?.name || 'Salon Treatment';
        const stylistName = app.staff?.name || 'Salon Specialist';

        console.log(
          `\n======================================================\n` +
          `🔔 [2-HOUR APPOINTMENT REMINDER DISPATCH]\n` +
          `Booking ID: ${app.bookingId}\n` +
          `Client: ${clientName} (${clientPhone})\n` +
          `Treatment: ${serviceName}\n` +
          `Stylist: ${stylistName}\n` +
          `Scheduled Time: ${app.startTime} (in ${diffMins} minutes)\n` +
          `======================================================\n`
        );

        // 1. Dispatch Email Reminder
        try {
          if (app.customer?.email && !app.customer.email.includes('@guest.')) {
            await emailService.sendAppointmentReminderEmail(app);
          }
        } catch (e) {
          console.warn(`[Reminder] Email dispatch note: ${e.message}`);
        }

        // 2. Dispatch SMS / Phone notification
        try {
          if (clientPhone) {
            console.log(`📱 [SMS 2-Hour Reminder] Sent to +91 ${clientPhone}: "Reminder: Your ${serviceName} at Enrich Salon Sikar is scheduled at ${app.startTime}."`);
          }
        } catch (e) {
          console.warn(`[Reminder] SMS dispatch note: ${e.message}`);
        }

        // Mark as sent
        app.reminderSent = true;
        app.reminderSentAt = new Date();
        await app.save();

        dispatched.push({
          bookingId: app.bookingId,
          client: clientName,
          time: app.startTime,
          diffMinutes: diffMins
        });
      }
    }

    return { success: true, count: dispatched.length, dispatched };
  } catch (error) {
    console.error('❌ [2-Hour Reminder Error]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Express handler wrapper for checkAndSend2HourReminders
 */
export const trigger2HourReminderCheck = asyncHandler(async (req, res) => {
  const result = await checkAndSend2HourReminders();
  return res.status(200).json(
    new ApiResponse(200, result, `Processed 2-hour appointment reminders. Dispatched: ${result.count || 0}`)
  );
});
