import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const BASE_URL = 'http://localhost:5000/api/v1';

async function runAuthTests() {
  console.log('\n======================================================');
  console.log('   LUXEPARLOUR COMPLETE AUTH TEST SUITE');
  console.log('======================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  const { User } = await import('../models/User.js');
  const { VerificationOTP } = await import('../models/VerificationOTP.js');

  const testEmail = `authtest_${Date.now()}@example.com`;
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = 'Password123!';
  const newPassword = 'NewPassword456!';

  console.log(`[SETUP] Test User Email: ${testEmail}, Phone: ${testPhone}`);

  try {
    // ----------------------------------------------------
    // TEST 1: REGISTRATION (Pending Verification)
    // ----------------------------------------------------
    console.log('\n--- TEST 1: User Registration ---');
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alexandria Miller',
        email: testEmail,
        phone: testPhone,
        password: testPassword,
        confirmPassword: testPassword
      })
    });

    const signupData = await signupRes.json();
    console.log('Signup HTTP Status:', signupRes.status);
    console.log('Signup Response Message:', signupData.message);

    if (signupRes.status !== 201) {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    }

    const createdUser = await User.findOne({ email: testEmail });
    console.log('User created in DB. Status:', createdUser.status, '| EmailVerified:', createdUser.isEmailVerified);
    if (createdUser.status !== 'pending_verification' || createdUser.isEmailVerified !== false) {
      throw new Error('User status not pending_verification or email verified unexpectedly');
    }

    // Check OTP in DB
    const otpDoc = await VerificationOTP.findOne({ userId: createdUser._id, type: 'email_verification' });
    if (!otpDoc) {
      throw new Error('VerificationOTP record not created in DB');
    }
    console.log('Verification OTP Record Exists in DB. Attempts:', otpDoc.attempts, '| Expiry:', otpDoc.expiresAt);

    // ----------------------------------------------------
    // TEST 2: LOGIN BLOCKED FOR UNVERIFIED USER
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Unverified Login Blocked ---');
    const unverifiedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const unverifiedLoginData = await unverifiedLoginRes.json();
    console.log('Unverified Login Status:', unverifiedLoginRes.status);
    console.log('Unverified Login Message:', unverifiedLoginData.message);
    if (unverifiedLoginRes.status !== 403) {
      throw new Error('Unverified user was not blocked with 403');
    }

    // ----------------------------------------------------
    // TEST 3: VERIFY EMAIL OTP - INCORRECT OTP
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Email Verification with Incorrect OTP ---');
    const wrongOtpRes = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: createdUser._id, otp: '000000' })
    });
    const wrongOtpData = await wrongOtpRes.json();
    console.log('Wrong OTP Status:', wrongOtpRes.status);
    console.log('Wrong OTP Message:', wrongOtpData.message);
    if (wrongOtpRes.status !== 400) {
      throw new Error('Wrong OTP was not rejected with 400');
    }

    // ----------------------------------------------------
    // TEST 4: VERIFY EMAIL OTP - CORRECT OTP
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Email Verification with Correct OTP ---');
    // Generate known OTP for testing verification
    const { otpService } = await import('../services/otp.service.js');
    const { plainOtp } = await otpService.createOTP({ userId: createdUser._id, type: 'email_verification', ignoreCooldown: true });

    const verifyEmailRes = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: createdUser._id, otp: plainOtp })
    });
    const verifyEmailData = await verifyEmailRes.json();
    console.log('Verify Email Status:', verifyEmailRes.status);
    console.log('Verify Email Message:', verifyEmailData.message);
    if (verifyEmailRes.status !== 200 || !verifyEmailData.data?.token) {
      throw new Error(`Email verification failed: ${JSON.stringify(verifyEmailData)}`);
    }

    const activatedUser = await User.findOne({ email: testEmail });
    console.log('User status after verification:', activatedUser.status, '| EmailVerified:', activatedUser.isEmailVerified);
    if (activatedUser.status !== 'active' || !activatedUser.isEmailVerified) {
      throw new Error('User was not activated after email verification');
    }

    let authToken = verifyEmailData.data.token;

    // ----------------------------------------------------
    // TEST 5: LOGIN AFTER VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Login with Active Verified Account ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Message:', loginData.message);
    if (loginRes.status !== 200 || !loginData.data?.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    authToken = loginData.data.token;

    // ----------------------------------------------------
    // TEST 6: FORGOT PASSWORD & ACCOUNT ENUMERATION PROTECTION
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Forgot Password & Enumeration Protection ---');
    // Non-existent email
    const unknownForgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_account@example.com' })
    });
    const unknownForgotData = await unknownForgotRes.json();
    console.log('Unknown Email Forgot Status:', unknownForgotRes.status);
    console.log('Unknown Email Forgot Message:', unknownForgotData.message);

    // Existing user email
    const knownForgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const knownForgotData = await knownForgotRes.json();
    console.log('Known Email Forgot Status:', knownForgotRes.status);
    console.log('Known Email Forgot Message:', knownForgotData.message);

    if (unknownForgotData.message !== knownForgotData.message) {
      throw new Error('Forgot password messages differ - potential account enumeration leak!');
    }

    // ----------------------------------------------------
    // TEST 7: PASSWORD RESET WITH OTP
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Password Reset Flow ---');
    const { plainOtp: resetOtp } = await otpService.createOTP({
      userId: createdUser._id,
      type: 'password_reset',
      ignoreCooldown: true
    });

    const resetPassRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otp: resetOtp,
        newPassword: newPassword,
        confirmPassword: newPassword
      })
    });
    const resetPassData = await resetPassRes.json();
    console.log('Reset Password Status:', resetPassRes.status);
    console.log('Reset Password Message:', resetPassData.message);
    if (resetPassRes.status !== 200) {
      throw new Error(`Reset password failed: ${JSON.stringify(resetPassData)}`);
    }

    // Verify login with new password
    const newPassLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword })
    });
    const newPassLoginData = await newPassLoginRes.json();
    console.log('New Password Login Status:', newPassLoginRes.status);
    if (newPassLoginRes.status !== 200) {
      throw new Error('Could not log in with updated password');
    }
    authToken = newPassLoginData.data.token;

    // ----------------------------------------------------
    // TEST 8: APPOINTMENT BLOCKED WHEN PHONE UNVERIFIED
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Appointment Booking Blocked (Phone Unverified) ---');
    const appointmentAttemptRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        serviceId: new mongoose.Types.ObjectId(),
        date: '2026-11-20',
        startTime: '10:00'
      })
    });
    const appointmentAttemptData = await appointmentAttemptRes.json();
    console.log('Booking Status (Phone Unverified):', appointmentAttemptRes.status);
    console.log('Booking Error Message:', appointmentAttemptData.message);
    if (appointmentAttemptRes.status !== 403 || !appointmentAttemptData.message.includes('Phone verification is required')) {
      throw new Error('Appointment booking was not blocked when phone is unverified');
    }

    // ----------------------------------------------------
    // TEST 9: SEND & VERIFY PHONE OTP
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Send & Verify Phone OTP ---');
    const sendPhoneOtpRes = await fetch(`${BASE_URL}/auth/send-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ phone: testPhone })
    });
    const sendPhoneOtpData = await sendPhoneOtpRes.json();
    console.log('Send Phone OTP Status:', sendPhoneOtpRes.status);
    console.log('Send Phone OTP Message:', sendPhoneOtpData.message);

    const { plainOtp: phoneOtp } = await otpService.createOTP({
      userId: createdUser._id,
      type: 'phone_verification',
      ignoreCooldown: true
    });

    const verifyPhoneRes = await fetch(`${BASE_URL}/auth/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ otp: phoneOtp })
    });
    const verifyPhoneData = await verifyPhoneRes.json();
    console.log('Verify Phone Status:', verifyPhoneRes.status);
    console.log('Verify Phone Message:', verifyPhoneData.message);
    if (verifyPhoneRes.status !== 200) {
      throw new Error(`Phone verification failed: ${JSON.stringify(verifyPhoneData)}`);
    }

    const fullyVerifiedUser = await User.findOne({ email: testEmail });
    console.log('User status after phone verification: isEmailVerified =', fullyVerifiedUser.isEmailVerified, '| isPhoneVerified =', fullyVerifiedUser.isPhoneVerified);
    if (!fullyVerifiedUser.isEmailVerified || !fullyVerifiedUser.isPhoneVerified) {
      throw new Error('User phone was not marked verified');
    }

    // Clean up test user & OTP records
    await User.deleteOne({ _id: createdUser._id });
    await VerificationOTP.deleteMany({ userId: createdUser._id });
    console.log('\n[TEARDOWN] Test user and OTP records cleanly purged.');

    console.log('\n======================================================');
    console.log('   🎉 ALL AUTHENTICATION BACKEND TESTS PASSED!');
    console.log('======================================================\n');
  } finally {
    await mongoose.disconnect();
  }
}

runAuthTests().catch((err) => {
  console.error('\n❌ AUTH TEST SUITE FATAL ERROR:', err.message);
  process.exit(1);
});
