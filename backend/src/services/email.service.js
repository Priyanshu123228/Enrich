import { createTransporter } from '../config/nodemailer.js';
import {
  getWelcomeEmailHtml,
  getAppointmentConfirmationHtml,
  getAppointmentCancellationHtml,
  getAppointmentRescheduledHtml,
  getPaymentReceiptHtml,
  getAppointmentReminderHtml,
  getVerificationOTPEmailHtml,
  getPasswordResetOTPEmailHtml
} from '../templates/emailTemplates.js';

const getEmailFrom = () =>
  process.env.EMAIL_FROM || '"Enrich Salon" <enrichparlour1212@gmail.com>';

/**
 * Helper to dispatch email with safe non-blocking error handling
 * Supports both Nodemailer SMTP and REST API fallbacks
 */
const sendMailSafe = async ({ to, subject, html, emailType }) => {
  if (!to) {
    console.warn(`⚠️ [EmailService] Skipping ${emailType}: No recipient email provided.`);
    return { success: false, reason: 'No recipient email' };
  }

  const emailFrom = getEmailFrom();

  try {
    const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '').trim();
    const isConfigured = user && pass && pass !== 'app_password_here' && pass !== 'your_email_app_password';

    if (!isConfigured) {
      console.log(
        `\n📧 [EMAIL DISPATCH NOTICE - ${emailType}]\n` +
        `To: ${to}\n` +
        `Subject: ${subject}\n` +
        `Status: Logged to console (Email credentials not configured)\n`
      );
      return { success: true, simulated: true };
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html
    });

    console.log(`✅ [EmailService] ${emailType} sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`⚠️ [EmailService Notice] Could not send ${emailType} via SMTP to ${to}: ${error.message}`);
    // Non-blocking: We log and return failure object safely without breaking client request
    return { success: false, error: error.message };
  }
};

export const emailService = {
  /**
   * 1. Account Email Verification OTP Email
   */
  sendVerificationOTPEmail: async (user, otp, expiryMinutes = 5) => {
    if (!user?.email) return { success: false, reason: 'No email' };

    // Always log OTP to server logs so admin/user can see it even if cloud provider blocks SMTP
    console.log(
      `\n======================================================\n` +
      `📧 [EMAIL OTP DISPATCH]\n` +
      `Recipient: ${user.email}\n` +
      `6-Digit Verification Code: ${otp}\n` +
      `Expires in: ${expiryMinutes} minutes\n` +
      `======================================================\n`
    );

    const html = getVerificationOTPEmailHtml({
      name: user.name || 'Valued Client',
      otp,
      expiryMinutes
    });

    return await sendMailSafe({
      to: user.email,
      subject: 'Verify Your Parlour Account - Enrich Salon',
      html,
      emailType: 'Email Verification OTP'
    });
  },

  /**
   * 2. Password Reset OTP Email
   */
  sendPasswordResetOTPEmail: async (user, otp, expiryMinutes = 5) => {
    if (!user?.email) return { success: false, reason: 'No email' };

    console.log(
      `\n======================================================\n` +
      `🔑 [PASSWORD RESET OTP DISPATCH]\n` +
      `Recipient: ${user.email}\n` +
      `6-Digit Code: ${otp}\n` +
      `Expires in: ${expiryMinutes} minutes\n` +
      `======================================================\n`
    );

    const html = getPasswordResetOTPEmailHtml({
      name: user.name || 'Valued Client',
      otp,
      expiryMinutes
    });

    return await sendMailSafe({
      to: user.email,
      subject: 'Reset Your Parlour Password - Enrich Salon',
      html,
      emailType: 'Password Reset OTP'
    });
  },

  /**
   * 3. Account Creation / Welcome Email
   */
  sendWelcomeEmail: async (user) => {
    if (!user?.email) return;
    const html = getWelcomeEmailHtml({
      name: user.name || 'Valued Client',
      email: user.email
    });

    return await sendMailSafe({
      to: user.email,
      subject: 'Welcome to LuxeParlour Salon & Spa',
      html,
      emailType: 'Account Welcome Email'
    });
  },

  /**
   * 4. Appointment Confirmation Email
   */
  sendAppointmentConfirmationEmail: async (appointment) => {
    const customer = appointment.customer;
    const service = appointment.service;
    const staff = appointment.staff;

    const to = customer?.email;
    if (!to) return;

    const html = getAppointmentConfirmationHtml({
      customerName: customer?.name || 'Valued Client',
      serviceName: service?.name || 'Salon Treatment',
      staffName: staff?.name || 'Assigned Stylist',
      date: appointment.date,
      timeWindow: `${appointment.startTime} - ${appointment.endTime}`,
      duration: appointment.duration || service?.duration || 45,
      bookingId: appointment.bookingId,
      price: appointment.finalAmount || appointment.price,
      paymentStatus: appointment.paymentStatus || 'pending'
    });

    return await sendMailSafe({
      to,
      subject: `Booking Confirmed: ${service?.name || 'Salon Session'} (#${appointment.bookingId})`,
      html,
      emailType: 'Appointment Confirmation Email'
    });
  },

  /**
   * 5. Appointment Cancellation Email
   */
  sendAppointmentCancellationEmail: async (appointment, reason = '') => {
    const customer = appointment.customer;
    const service = appointment.service;
    const staff = appointment.staff;

    const to = customer?.email;
    if (!to) return;

    const html = getAppointmentCancellationHtml({
      customerName: customer?.name || 'Valued Client',
      serviceName: service?.name || 'Salon Treatment',
      staffName: staff?.name || 'Stylist',
      date: appointment.date,
      bookingId: appointment.bookingId,
      reason: reason || appointment.cancellationReason || 'Cancelled upon client request'
    });

    return await sendMailSafe({
      to,
      subject: `Appointment Cancelled: #${appointment.bookingId}`,
      html,
      emailType: 'Appointment Cancellation Email'
    });
  },

  /**
   * 6. Appointment Rescheduled Email
   */
  sendAppointmentRescheduledEmail: async (appointment, oldDetails = {}) => {
    const customer = appointment.customer;
    const service = appointment.service;
    const staff = appointment.staff;

    const to = customer?.email;
    if (!to) return;

    const html = getAppointmentRescheduledHtml({
      customerName: customer?.name || 'Valued Client',
      serviceName: service?.name || 'Salon Treatment',
      staffName: staff?.name || 'Stylist',
      oldDate: oldDetails.date || appointment.date,
      newDate: appointment.date,
      newTime: `${appointment.startTime} - ${appointment.endTime}`,
      bookingId: appointment.bookingId
    });

    return await sendMailSafe({
      to,
      subject: `Appointment Rescheduled: #${appointment.bookingId} for ${appointment.date}`,
      html,
      emailType: 'Appointment Rescheduled Email'
    });
  },

  /**
   * 7. Payment Confirmation / Receipt Email
   */
  sendPaymentConfirmationEmail: async (appointment, payment = {}) => {
    const customer = appointment.customer;
    const service = appointment.service;

    const to = customer?.email;
    if (!to) return;

    const html = getPaymentReceiptHtml({
      customerName: customer?.name || 'Valued Client',
      serviceName: service?.name || 'Salon Treatment',
      bookingId: appointment.bookingId,
      paymentId: payment.razorpayPaymentId || appointment.razorpayPaymentId || 'N/A',
      orderId: payment.razorpayOrderId || appointment.razorpayOrderId || '',
      amount: appointment.finalAmount || appointment.price,
      paymentMethod: 'Razorpay Online Gateway',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    });

    return await sendMailSafe({
      to,
      subject: `Payment Receipt: $${appointment.finalAmount || appointment.price} for #${appointment.bookingId}`,
      html,
      emailType: 'Payment Receipt Email'
    });
  },

  /**
   * 8. Appointment Reminder Email
   */
  sendAppointmentReminderEmail: async (appointment) => {
    const customer = appointment.customer;
    const service = appointment.service;
    const staff = appointment.staff;

    const to = customer?.email;
    if (!to) return;

    const html = getAppointmentReminderHtml({
      customerName: customer?.name || 'Valued Client',
      serviceName: service?.name || 'Salon Treatment',
      staffName: staff?.name || 'Stylist',
      date: appointment.date,
      timeWindow: `${appointment.startTime} - ${appointment.endTime}`,
      bookingId: appointment.bookingId
    });

    return await sendMailSafe({
      to,
      subject: `Reminder: Your Appointment Tomorrow (${appointment.date})`,
      html,
      emailType: 'Appointment Reminder Email'
    });
  }
};
