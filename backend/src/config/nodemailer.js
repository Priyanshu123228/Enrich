import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force global DNS lookups to IPv4 first
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Safe fallback
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env is loaded reliably
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Configure Nodemailer Transporter
 * Uses connection pooling and strict IPv4 DNS lookup to eliminate connection latency and IPv6 issues
 */
export const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '')
    .replace(/\s+/g, '')
    .trim();

  return nodemailer.createTransport({
    pool: true, // 🚀 Re-use persistent SMTP connection for fast, reliable delivery
    maxConnections: 3,
    maxMessages: 100,
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    // Strictly force IPv4 address resolution
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, (err, address) => {
        callback(err, address, 4);
      });
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
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
    await transporter.verify();
    console.log(`✅ Nodemailer SMTP Transporter connected successfully [${user}].`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Nodemailer SMTP Verification Notice: ${error.message}. Running in safe fallback mode.`);
    return false;
  }
};
