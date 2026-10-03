import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force strict IPv4 resolution across all DNS resolvers and prototypes.
// Cloud environments like Render lack outbound IPv6 routing. Nodemailer creates internal
// instances of dns.Resolver and randomly picks IPv6 addresses from resolve6(), causing ENETUNREACH.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

// 1. Disable resolve6 on dns namespace
dns.resolve6 = function (hostname, options, callback) {
  const cb = typeof options === 'function' ? options : callback;
  if (typeof cb === 'function') cb(null, []);
};

if (dns.promises && dns.promises.resolve6) {
  dns.promises.resolve6 = async () => [];
}

// 2. Disable resolve6 on dns.Resolver prototype (used internally by Nodemailer)
if (dns.Resolver && dns.Resolver.prototype) {
  dns.Resolver.prototype.resolve6 = function (hostname, options, callback) {
    const cb = typeof options === 'function' ? options : callback;
    if (typeof cb === 'function') cb(null, []);
  };
}

if (dns.promises && dns.promises.Resolver && dns.promises.Resolver.prototype) {
  dns.promises.Resolver.prototype.resolve6 = async () => [];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env is loaded reliably
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Configure Nodemailer Transporter
 * Uses connection pooling and strict IPv4 DNS resolution to eliminate connection latency and ENETUNREACH errors.
 */
export const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '')
    .replace(/\s+/g, '')
    .trim();

  return nodemailer.createTransport({
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
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
      console.log('Nodemailer SMTP: Running in simulated development mode.');
      return false;
    }
    await transporter.verify();
    console.log('Nodemailer SMTP Transporter connected successfully [' + user + '].');
    return true;
  } catch (error) {
    console.warn('Nodemailer SMTP Verification Notice: ' + error.message + '. Running in safe fallback mode.');
    return false;
  }
};