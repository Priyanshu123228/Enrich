import { transporter } from '../config/nodemailer.js';
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
  process.env.EMAIL_FROM || '"Enrich Beauty Parlour & Cosmetic Clinic" <enrichparlour1212@gmail.com>';

let cachedBrevoSender = null;

/**
 * Dynamically fetch or determine the verified sender email for Brevo
 */
const getBrevoSender = async (apiKey) => {
  if (process.env.BREVO_SENDER_EMAIL) {
    return {
      name: process.env.EMAIL_FROM_NAME || 'Enrich Beauty Parlour & Cosmetic Clinic',
      email: process.env.BREVO_SENDER_EMAIL.trim()
    };
  }

  if (cachedBrevoSender) {
    return cachedBrevoSender;
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/senders', {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const activeSender = data.senders?.find((s) => s.active) || data.senders?.[0];
      if (activeSender?.email) {
        cachedBrevoSender = {
          name: process.env.EMAIL_FROM_NAME || activeSender.name || 'Enrich Beauty Parlour & Cosmetic Clinic',
          email: activeSender.email
        };
        console.log(`📡 [Brevo Auto-Detect] Using verified sender from Brevo account: ${cachedBrevoSender.email}`);
        return cachedBrevoSender;
      }
    }
  } catch {
    // Fallback to defaults
  }

  return {
    name: process.env.EMAIL_FROM_NAME || 'Enrich Beauty Parlour & Cosmetic Clinic',
    email: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'enrichparlour1212@gmail.com'
  };
};

/**
 * Dispatch email via HTTPS REST API (Brevo / Resend) to bypass Render Free tier SMTP port blocks (25/465/587)
 */
const sendViaRestApi = async ({ to, subject, html, text }) => {
  const brevoApiKey = (
    process.env.BREVO_API_KEY ||
    process.env.BREVO_KEY ||
    process.env.SIB_API_KEY ||
    process.env.SENDINBLUE_API_KEY ||
    ''
  ).trim();

  const resendApiKey = (
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    ''
  ).trim();

  // 1. Brevo / Sendinblue REST API (HTTPS Port 443 - sends to any email worldwide without custom domain)
  if (brevoApiKey) {
    try {
      const sender = await getBrevoSender(brevoApiKey);

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender,
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Brevo API error: ' + JSON.stringify(data));
      }
      return { success: true, messageId: data.messageId, provider: 'Brevo HTTPS API' };
    } catch (brevoErr) {
      console.warn(`⚠️ [EmailService Brevo Notice] Brevo API error: ${brevoErr.message}`);
    }
  }

  // 2. Resend REST API (HTTPS Port 443)
  if (resendApiKey) {
    try {
      let from = (process.env.RESEND_FROM || process.env.EMAIL_FROM_ADDRESS || '').trim();
      // Resend requires a verified domain; if unverified or public (@gmail/@yahoo/@outlook), fallback to onboarding@resend.dev
      if (!from || from.includes('@gmail.') || from.includes('@yahoo.') || from.includes('@hotmail.') || from.includes('@outlook.')) {
        from = 'onboarding@resend.dev';
      }
      const fromName = process.env.EMAIL_FROM_NAME || 'Enrich Beauty Parlour & Cosmetic Clinic';

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${fromName} <${from}>`,
          to: [to],
          subject,
          html,
          text
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Resend API error: ' + JSON.stringify(data));
      }
      return { success: true, messageId: data.id, provider: 'Resend HTTPS API' };
    } catch (resendErr) {
      console.warn(`⚠️ [EmailService Resend Notice] Resend API error: ${resendErr.message}`);
    }
  }

  return null;
};

/**
 * Universal safe email dispatcher
 * Tries HTTPS REST API first (if API key is present), then falls back to Nodemailer SMTP
 */
const sendMailSafe = async ({ to, subject, html, text, emailType }) => {
  if (!to) {
    console.warn(`⚠️ [EmailService] Skipping ${emailType}: No recipient email provided.`);
    return { success: false, reason: 'No recipient email' };
  }

  const emailFrom = getEmailFrom();
  const plainText = text || (html || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Try HTTPS REST API first if configured (Bypasses Render cloud firewall port blocks)
  try {
    const restResult = await sendViaRestApi({ to, subject, html, text: plainText });
    if (restResult) {
      console.log(`✅ [EmailService] ${emailType} sent to ${to} via ${restResult.provider} (ID: ${restResult.messageId})`);
      return restResult;
    }
  } catch (restError) {
    console.warn(`⚠️ [EmailService REST Notice] REST API failed (${restError.message}), falling back to SMTP`);
  }

  // 2. Fallback to Nodemailer SMTP
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

    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
      text: plainText
    });

    console.log(`✅ [EmailService] ${emailType} sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`⚠️ [EmailService Notice] Could not send ${emailType} via SMTP to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const emailService = {
  /**
   * 1. Account Email Verification OTP Email
   */
  sendVerificationOTPEmail: async (user, otp, expiryMinutes = 5) => {
    if (!user?.email) return { success: false, reason: 'No email' };

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
      subject: 'Verify Your Account - Enrich Beauty Parlour & Cosmetic Clinic',
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
      subject: 'Reset Your Password - Enrich Beauty Parlour & Cosmetic Clinic',
      html,
      emailType: 'Password Reset OTP'
    });
  },

  /**
   * 3. Account Creation / Welcome Email
   */
  sendWelcomeEmail: async (user) => {
    if (!user?.email) return { success: false, reason: 'No email' };

    console.log(
      `\n======================================================\n` +
      `🎉 [WELCOME EMAIL DISPATCH]\n` +
      `Recipient: ${user.email} (${user.name})\n` +
      `======================================================\n`
    );

    const html = getWelcomeEmailHtml({
      name: user.name || 'Valued Client',
      email: user.email
    });

    return await sendMailSafe({
      to: user.email,
      subject: 'Welcome to Enrich Beauty Parlour & Cosmetic Clinic',
      html,
      emailType: 'Account Welcome Email'
    });
  },

  /**
   * 4. Appointment Confirmation Email
   */
  sendAppointmentConfirmationEmail: async (appointment) => {
    const customer = appointment?.customer;
    const service = appointment?.service;
    const staff = appointment?.staff;

    const to = customer?.email;
    if (!to) {
      console.warn('⚠️ [EmailService] Cannot send Appointment Confirmation: No customer email on appointment object.');
      return { success: false, reason: 'No customer email' };
    }

    console.log(
      `\n======================================================\n` +
      `📅 [APPOINTMENT CONFIRMATION EMAIL DISPATCH]\n` +
      `Recipient: ${to} (${customer?.name})\n` +
      `Booking ID: #${appointment.bookingId}\n` +
      `Date & Time: ${appointment.date} at ${appointment.startTime}\n` +
      `======================================================\n`
    );

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
    const customer = appointment?.customer;
    const service = appointment?.service;
    const staff = appointment?.staff;

    const to = customer?.email;
    if (!to) return { success: false, reason: 'No customer email' };

    console.log(
      `\n======================================================\n` +
      `❌ [APPOINTMENT CANCELLATION EMAIL DISPATCH]\n` +
      `Recipient: ${to} (${customer?.name})\n` +
      `Booking ID: #${appointment.bookingId}\n` +
      `Reason: ${reason || appointment.cancellationReason || 'Client request'}\n` +
      `======================================================\n`
    );

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
    const customer = appointment?.customer;
    const service = appointment?.service;
    const staff = appointment?.staff;

    const to = customer?.email;
    if (!to) return { success: false, reason: 'No customer email' };

    console.log(
      `\n======================================================\n` +
      `🔄 [APPOINTMENT RESCHEDULE EMAIL DISPATCH]\n` +
      `Recipient: ${to} (${customer?.name})\n` +
      `Booking ID: #${appointment.bookingId}\n` +
      `New Date & Time: ${appointment.date} at ${appointment.startTime}\n` +
      `======================================================\n`
    );

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
    const customer = appointment?.customer;
    const service = appointment?.service;

    const to = customer?.email;
    if (!to) return { success: false, reason: 'No customer email' };

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
      subject: `Payment Receipt: ₹${appointment.finalAmount || appointment.price} for #${appointment.bookingId}`,
      html,
      emailType: 'Payment Receipt Email'
    });
  },

  /**
   * 8. Appointment Reminder Email
   */
  sendAppointmentReminderEmail: async (appointment) => {
    const customer = appointment?.customer;
    const service = appointment?.service;
    const staff = appointment?.staff;

    const to = customer?.email;
    if (!to) return { success: false, reason: 'No customer email' };

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
