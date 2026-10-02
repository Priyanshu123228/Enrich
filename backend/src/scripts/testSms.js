import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { smsService } from '../services/sms.service.js';

async function testSms() {
  console.log('Testing Twilio dispatch with:');
  console.log('ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
  console.log('PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);

  try {
    const res = await smsService.sendPhoneOTP({
      phone: '9024659116',
      otp: '482731',
      userName: 'Priyanshu'
    });
    console.log('Result:', res);
  } catch (err) {
    console.error('Test SMS caught error:', err);
  }
}

testSms();
