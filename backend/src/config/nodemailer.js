import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force all DNS resolutions in Node.js to prioritize IPv4 (fixes Render ENETUNREACH IPv6 issue)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in older Node versions
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env is loaded reliably
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Configure Nodemailer Transporter
 * Explicitly uses Port 587 (STARTTLS) and IPv4 to guarantee compatibility with Render cloud networking
 */
export const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  // Use port 587 for cloud platforms (port 465 SSL gets blocked on Render)
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '')
    .replace(/\s+/g, '')
    .trim();

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // false for port 587 (STARTTLS)
    auth: {
      user,
      pass
    },
    family: 4, // 🚀 Force IPv4 socket connection
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
