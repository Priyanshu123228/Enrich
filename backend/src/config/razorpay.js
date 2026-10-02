import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env is loaded reliably
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

  // Safe debugging diagnostics (NEVER prints the actual secret)
  console.log('💳 [Razorpay Init] Key ID exists:', !!key_id);
  console.log('💳 [Razorpay Init] Key Prefix:', key_id ? key_id.slice(0, 8) : 'none');
  console.log('💳 [Razorpay Init] Secret exists:', !!key_secret);

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing in backend/.env'
    );
  }

  // Instantiate or refresh if credentials changed
  if (
    !razorpayInstance ||
    razorpayInstance.key_id !== key_id ||
    razorpayInstance.key_secret !== key_secret
  ) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret
    });
  }

  return razorpayInstance;
};

export const getRazorpayKeyId = () => {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  if (!key_id) {
    throw new Error('RAZORPAY_KEY_ID is missing in backend/.env');
  }
  return key_id;
};

