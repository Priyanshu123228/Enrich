import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { createTransporter } from '../config/nodemailer.js';

async function testEmail() {
  console.log('Testing SMTP connection with:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || process.env.SMTP_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || process.env.SMTP_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER || process.env.SMTP_USER);
  const rawPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '';
  console.log('Pass length:', rawPass.length, 'Contains spaces:', rawPass.includes(' '));

  const transporter = createTransporter();

  try {
    console.log('\n1. Verifying SMTP transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully!');

    console.log('\n2. Attempting to send test OTP email to:', process.env.EMAIL_USER);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Enrich Beauty Parlour & Cosmetic Clinic" <enrichparlour1212@gmail.com>',
      to: process.env.EMAIL_USER || 'enrichparlour1212@gmail.com',
      subject: 'Verify Your Parlour Account (Test)',
      html: '<h2>Your test OTP is: <strong>482731</strong></h2><p>This is a direct test email from Enrich Beauty Parlour & Cosmetic Clinic backend.</p>'
    });
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('SMTP Response:', info.response);
  } catch (err) {
    console.error('❌ Email dispatch failed:', err.message);
    if (err.response) console.error('SMTP Error response:', err.response);
  }
}

testEmail();
