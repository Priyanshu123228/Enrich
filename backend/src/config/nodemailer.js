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
 * Supports EMAIL_PASS / EMAIL_PASSWORD / SMTP_PASS and forces IPv4 (family: 4) for Render cloud hosting
 */
export const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '')
    .replace(/\s+/g, '')
    .trim();
  const secure = process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true' || port === 465;

  if (host === 'smtp.gmail.com' || user.endsWith('@gmail.com') || !process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      },
      family: 4,
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
    family: 4,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });
};

export const transporter = createTransporter();

/**
 * Verify SMTP Transporter readiness
 */
export const verifyEmailTransporter = async () => {
  try {
    const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '').trim();

    if (!user || !pass || pass === 'app_password_here' || pass === 'your_email_app_password') {
      console.log('⚠️ Nodemailer SMTP: Running in simulated development mode.');
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
