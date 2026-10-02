import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env is loaded reliably
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Configure Nodemailer Transporter
 * Supports both EMAIL_* (standard prompt specs) and SMTP_* (legacy) env variables
 */
export const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  // Strip all whitespace from Gmail App Passwords (e.g. "svml ebwm ihav ckak" -> "svmlebwmihavckak")
  const pass = (process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host === 'smtp.gmail.com' || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

export const transporter = createTransporter();

/**
 * Verify SMTP Transporter readiness
 */
export const verifyEmailTransporter = async () => {
  try {
    const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const pass = (process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '').trim();

    if (!user || !pass || pass === 'app_password_here' || pass === 'your_email_app_password') {
      console.log('ℹ️ Nodemailer SMTP: Running in simulated development mode (Emails will be logged to console in dev).');
      return false;
    }
    const t = createTransporter();
    await t.verify();
    console.log(`✅ Nodemailer SMTP Transporter connected successfully [${user}].`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Nodemailer SMTP Verification Notice: ${error.message}. Running in safe fallback mode.`);
    return false;
  }
};


