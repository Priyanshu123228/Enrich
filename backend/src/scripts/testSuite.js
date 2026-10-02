import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Staff } from '../models/Staff.js';
import { Appointment } from '../models/Appointment.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';
import { Offer } from '../models/Offer.js';
import { timeToMinutes, calculateEndTime, isIntervalOverlap, checkSlotCollision } from '../services/slot.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env is loaded reliably
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Configurable API base URL with intelligent fallback
const PORT = process.env.PORT || 5000;
const rawBase = process.env.API_BASE_URL || `http://localhost:${PORT}`;
const API_BASE = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api/v1`;

// Test statistics
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, testName, details = '') {
  stats.total++;
  if (condition) {
    stats.passed++;
    stats.tests.push({ name: testName, status: 'PASSED', details });
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    stats.failed++;
    stats.tests.push({ name: testName, status: 'FAILED', details });
    console.error(`  ✗ [FAIL] ${testName} - ${details}`);
  }
}

/**
 * Robust JSON fetcher with connection error handling
 */
async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, ok: res.ok };
  } catch (err) {
    const errorCode = err.cause?.code || err.code || 'CONNECTION_ERROR';
    console.error(`  ⚠️  [Network Error on ${endpoint}]: ${err.message} (${errorCode})`);
    return {
      status: 0,
      ok: false,
      error: err.message,
      data: { success: false, message: `Failed to connect to ${url}: ${err.message}` }
    };
  }
}

/**
 * Pre-flight check: Verify that the Express backend is running and reachable
 */
async function checkBackendAvailability() {
  console.log('Checking backend availability...');
  console.log(`API Base URL: ${API_BASE}\n`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      console.log('✓ Backend is online and healthy.\n');
      return true;
    } else {
      console.error(`✗ Backend responded with unexpected status code: ${res.status}\n`);
      return false;
    }
  } catch (err) {
    const errorCode = err.cause?.code || err.code || err.name || 'ECONNREFUSED';
    console.error('✗ Backend unavailable');
    console.error(`  ${errorCode}\n`);
    console.error('======================================================');
    console.error('            BACKEND CONNECTION ERROR');
    console.error('======================================================');
    console.error(`Unable to connect to:\n${API_BASE}`);
    console.error('\nPossible cause:');
    console.error('- The Express backend server is offline or not running.');
    console.error(`- Port ${PORT} is not accepting connections.\n`);
    console.error('To resolve this:');
    console.error('  1. Open a terminal in the "backend" directory:');
    console.error('     cd backend');
    console.error('  2. Start the Express development server:');
    console.error('     npm run dev');
    console.error('  3. Re-run the test suite in a separate terminal:');
    console.error('     node src/scripts/testSuite.js');
    console.error('======================================================\n');
    return false;
  }
}

/**
 * Display formatted test summary and exit code
 */
function printSummary(abortedReason = null) {
  const successRate =
    stats.total === 0
      ? '0.00%'
      : `${((stats.passed / stats.total) * 100).toFixed(2)}%`;

  console.log('\n======================================================');
  console.log('                 TEST RESULTS SUMMARY');
  console.log('======================================================');
  console.log(`Total Tests Executed : ${stats.total}`);
  console.log(`Passed               : ${stats.passed}`);
  console.log(`Failed               : ${stats.failed}`);
  console.log(`Success Rate         : ${successRate}`);
  console.log('======================================================\n');

  if (abortedReason || stats.total === 0) {
    console.log('>>> TEST SUITE ABORTED - BACKEND SERVER UNAVAILABLE <<<\n');
    process.exit(1);
  } else if (stats.failed === 0) {
    console.log('>>> ALL SYSTEMATIC BACKEND TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    console.error(`>>> TEST SUITE FAILED (${stats.failed} failed test(s)) <<<\n`);
    process.exit(1);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   LUXEPARLOUR SYSTEMATIC TEST SUITE - PHASE 14');
  console.log('======================================================\n');

  // 0. Pre-flight Backend Availability Check
  const isAvailable = await checkBackendAvailability();
  if (!isAvailable) {
    printSummary('backend_offline');
    return;
  }

  const timestamp = Date.now();
  const testEmail1 = `test.user1.${timestamp}@luxeparlour.com`;
  const testEmail2 = `test.user2.${timestamp}@luxeparlour.com`;
  const testAdminEmail = `test.admin.${timestamp}@luxeparlour.com`;
  const testPhone1 = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const testPhone2 = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const adminEmail = testAdminEmail;
  const adminPassword = 'Password@123';

  let appointment1Id = '';
  let appointment2Id = '';
  let appointment3Id = '';

  try {
    // Connect to DB to seed test admin
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'Enrich' });
    await User.create({
      name: 'Test Administrator',
      email: testAdminEmail,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });

    let tokenUser1 = '';
    let user1Id = '';
    let tokenUser2 = '';
    let user2Id = '';
    let tokenAdmin = '';
    let testServiceId = '';
    let testStaffId = '';
    let testDate = '';

    // Calculate a future weekday date for tests (e.g. next Wednesday to guarantee working shift)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    // Ensure it's Monday-Friday (1-5)
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }
    testDate = futureDate.toISOString().split('T')[0];

    // Clean any leftover appointments on test date
    await Appointment.deleteMany({ date: testDate });

    console.log(`Test Execution Date Context: ${testDate} (Day of Week: ${futureDate.getDay()})\n`);

    // ----------------------------------------------------------------
    // SECTION 1: AUTHENTICATION TESTS
    // ----------------------------------------------------------------
    console.log('--- SECTION 1: AUTHENTICATION TESTS ---');

    // 1.1 Customer Registration
    const signup1 = await fetchJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Customer One',
        email: testEmail1,
        phone: testPhone1,
        password: 'Password@123'
      })
    });
    assert(signup1.status === 201 && signup1.data.data?.token, '1.1 Customer 1 registration creates account & returns JWT');
    tokenUser1 = signup1.data.data?.token;
    user1Id = signup1.data.data?.user?._id;

    // 1.2 Duplicate Email Prevention
    const dupEmail = await fetchJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Email User',
        email: testEmail1,
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        password: 'Password@123'
      })
    });
    assert(dupEmail.status === 409, '1.2 Registration rejects duplicate email with HTTP 409');

    // 1.3 Duplicate Phone Prevention
    const dupPhone = await fetchJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Phone User',
        email: `other.${timestamp}@test.com`,
        phone: testPhone1,
        password: 'Password@123'
      })
    });
    assert(dupPhone.status === 409, '1.3 Registration rejects duplicate phone with HTTP 409');

    // 1.4 Customer 2 Registration
    const signup2 = await fetchJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Customer Two',
        email: testEmail2,
        phone: testPhone2,
        password: 'Password@123'
      })
    });
    assert(signup2.status === 201 && signup2.data.data?.token, '1.4 Customer 2 registration creates account');
    tokenUser2 = signup2.data.data?.token;
    user2Id = signup2.data.data?.user?._id;

    // 1.5 Valid Login
    const loginRes = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail1,
        password: 'Password@123'
      })
    });
    assert(loginRes.status === 200 && loginRes.data.data?.token, '1.5 Login with valid credentials succeeds');

    // 1.6 Invalid Password Login
    const badLogin = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail1,
        password: 'WrongPassword!999'
      })
    });
    assert(badLogin.status === 401, '1.6 Login with incorrect password returns HTTP 401');

    // 1.7 Nonexistent User Login
    const nonExistent = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent.user.xyz@luxury.test',
        password: 'Password@123'
      })
    });
    assert(nonExistent.status === 401, '1.7 Login for non-existent user returns HTTP 401');

    // 1.8 Admin Login
    const adminLogin = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      })
    });
    assert(adminLogin.status === 200 && adminLogin.data.data?.user?.role === 'admin', '1.8 Admin login succeeds with admin role');
    tokenAdmin = adminLogin.data.data?.token;

    // 1.9 Fetch Profile with Valid Token
    const meRes = await fetchJson('/auth/me', {
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });
    assert(meRes.status === 200 && meRes.data.data?.email === testEmail1, '1.9 /auth/me returns customer profile');

    // 1.10 Fetch Profile without Token
    const noToken = await fetchJson('/auth/me');
    assert(noToken.status === 401, '1.10 /auth/me without token returns HTTP 401 Unauthorized');


    // ----------------------------------------------------------------
    // SECTION 2: AUTHORIZATION & RBAC TESTS
    // ----------------------------------------------------------------
    console.log('\n--- SECTION 2: AUTHORIZATION (RBAC) TESTS ---');

    // 2.1 Customer attempting Admin-only endpoint
    const forbiddenRes = await fetchJson('/appointments/admin/all', {
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });
    assert(forbiddenRes.status === 403, '2.1 Customer accessing /appointments/admin/all returns HTTP 403 Forbidden');

    // 2.2 Admin accessing Admin endpoint
    const adminAppRes = await fetchJson('/appointments/admin/all', {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    assert(adminAppRes.status === 200, '2.2 Admin accessing /appointments/admin/all returns HTTP 200 OK');


    // ----------------------------------------------------------------
    // SECTION 3: SERVICES & STAFF CATALOG TESTS
    // ----------------------------------------------------------------
    console.log('\n--- SECTION 3: SERVICES & STAFF TESTS ---');

    const servicesRes = await fetchJson('/services?limit=10');
    assert(servicesRes.status === 200 && servicesRes.data.data?.services?.length > 0, '3.1 Public services catalog lists active treatments');
    const serviceList = servicesRes.data.data?.services || [];
    // Pick a 60 min service or first available
    const chosenService = serviceList.find((s) => s.duration === 60) || serviceList[0];
    testServiceId = chosenService?._id;

    const staffRes = await fetchJson('/staff');
    assert(staffRes.status === 200 && staffRes.data.data?.length > 0, '3.2 Staff roster list returns active stylists');
    const staffList = staffRes.data.data || [];
    testStaffId = staffList[0]?._id;


    // ----------------------------------------------------------------
    // SECTION 4: 8 IMPORTANT BOOKING SCENARIOS
    // ----------------------------------------------------------------
    console.log('\n--- SECTION 4: 8 CRITICAL BOOKING SCENARIOS ---');

    // SCENARIO 5 FIRST (Verify 60-min service duration calculation)
    console.log('Testing Scenario 5: Service duration calculation...');
    const bookSlotTime = '10:00';
    const createRes1 = await fetchJson('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        serviceId: testServiceId,
        staffId: testStaffId,
        date: testDate,
        startTime: bookSlotTime
      })
    });
    assert(
      createRes1.status === 201 && createRes1.data.data?.endTime === calculateEndTime(bookSlotTime, chosenService.duration),
      `4.5 Scenario 5: 60-min treatment at ${bookSlotTime} creates appointment ending at ${calculateEndTime(bookSlotTime, chosenService.duration)}`
    );
    appointment1Id = createRes1.data.data?._id;

    // SCENARIO 1: Two users book the EXACT same slot
    console.log('Testing Scenario 1: Double booking collision...');
    const createResConflict = await fetchJson('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: JSON.stringify({
        serviceId: testServiceId,
        staffId: testStaffId,
        date: testDate,
        startTime: bookSlotTime
      })
    });
    assert(
      createResConflict.status === 409,
      '4.1 Scenario 1: User 2 booking the exact same slot receives HTTP 409 Double Booking Conflict'
    );

    // SCENARIO 6: Another appointment starts during that duration (e.g. 10:30 when 10:00-11:00 is occupied)
    console.log('Testing Scenario 6: Overlapping appointment collision...');
    const createResOverlap = await fetchJson('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: JSON.stringify({
        serviceId: testServiceId,
        staffId: testStaffId,
        date: testDate,
        startTime: '10:30' // Overlaps with 10:00 - 11:00
      })
    });
    assert(
      createResOverlap.status === 409,
      '4.6 Scenario 6: Booking an appointment starting at 10:30 (during 10:00-11:00) receives HTTP 409 Overlap Collision'
    );

    // SCENARIO 7: Customer tries to book a past date
    console.log('Testing Scenario 7: Past date booking prevention...');
    const createPastDate = await fetchJson('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        serviceId: testServiceId,
        staffId: testStaffId,
        date: '2020-01-15',
        startTime: '10:00'
      })
    });
    assert(
      createPastDate.status === 400,
      '4.7 Scenario 7: Booking a past date (2020-01-15) is rejected with HTTP 400 Bad Request'
    );

    // SCENARIO 2: Staff is unavailable (e.g. Outside shift hours / Off day)
    console.log('Testing Scenario 2: Staff unavailability...');
    const createOffShift = await fetchJson('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        serviceId: testServiceId,
        staffId: testStaffId,
        date: testDate,
        startTime: '04:00' // 4:00 AM is outside any salon shift
      })
    });
    assert(
      createOffShift.status === 400,
      '4.2 Scenario 2: Booking outside staff shift hours (04:00 AM) is rejected with HTTP 400'
    );

    // SCENARIO 8: Customer tries to access another customer's appointment (IDOR)
    console.log('Testing Scenario 8: IDOR Unauthorized appointment access...');
    const idorView = await fetchJson(`/appointments/${appointment1Id}`, {
      headers: { Authorization: `Bearer ${tokenUser2}` } // User 2 trying to view User 1's appointment
    });
    assert(
      idorView.status === 403,
      '4.8.1 Scenario 8: User 2 trying to view User 1 appointment by ID is rejected with HTTP 403 Forbidden'
    );

    const idorCancel = await fetchJson(`/appointments/${appointment1Id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: JSON.stringify({ reason: 'Malicious cancellation attempt' })
    });
    assert(
      idorCancel.status === 403,
      '4.8.2 Scenario 8: User 2 trying to cancel User 1 appointment is rejected with HTTP 403 Forbidden'
    );

    const idorReschedule = await fetchJson(`/appointments/${appointment1Id}/reschedule`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: JSON.stringify({ newDate: testDate, newStartTime: '16:00' })
    });
    assert(
      idorReschedule.status === 403,
      '4.8.3 Scenario 8: User 2 trying to reschedule User 1 appointment is rejected with HTTP 403 Forbidden'
    );

    // SCENARIO 3: Appointment is cancelled -> Slot is freed immediately
    console.log('Testing Scenario 3: Cancellation slot release...');
    const cancelRes = await fetchJson(`/appointments/${appointment1Id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({ reason: 'Schedule conflict' })
    });
    assert(
      cancelRes.status === 200 && cancelRes.data.data?.status === 'cancelled',
      '4.3.1 Scenario 3: Owner cancels appointment successfully'
    );

    // Now User 2 books the freed slot at 10:00
    const rebookSlot = await fetchJson('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: JSON.stringify({
        serviceId: testServiceId,
        staffId: testStaffId,
        date: testDate,
        startTime: bookSlotTime
      })
    });
    assert(
      rebookSlot.status === 201,
      '4.3.2 Scenario 3: Cancelled slot is immediately freed and User 2 can now book it successfully'
    );
    appointment2Id = rebookSlot.data.data?._id;

    // SCENARIO 4: Appointment is rescheduled
    console.log('Testing Scenario 4: Rescheduling appointment...');
    const rescheduleRes = await fetchJson(`/appointments/${appointment2Id}/reschedule`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: JSON.stringify({
        newDate: testDate,
        newStartTime: '16:00'
      })
    });
    assert(
      rescheduleRes.status === 200 && rescheduleRes.data.data?.startTime === '16:00',
      '4.4.1 Scenario 4: User 2 successfully reschedules appointment from 10:00 to 16:00'
    );

    // Verify previous slot 10:00 is freed up again after reschedule
    const user1Reclaim = await fetchJson('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        serviceId: testServiceId,
        staffId: testStaffId,
        date: testDate,
        startTime: '10:00'
      })
    });
    assert(
      user1Reclaim.status === 201,
      '4.4.2 Scenario 4: Slot at 10:00 is freed up after reschedule and User 1 books it successfully'
    );
    appointment3Id = user1Reclaim.data.data?._id;


    // ----------------------------------------------------------------
    // SECTION 5: PAYMENTS & RAZORPAY INTEGRATION TESTS
    // ----------------------------------------------------------------
    console.log('\n--- SECTION 5: PAYMENTS INTEGRATION TESTS ---');

    // 5.1 Create Order
    const orderRes = await fetchJson('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({ appointmentId: appointment3Id })
    });
    assert(
      orderRes.status === 200 && orderRes.data.data?.orderId,
      '5.1 Razorpay order created with valid orderId and amount'
    );
    const razorpayOrderId = orderRes.data.data?.orderId;

    // 5.2 IDOR on Payment Creation
    const idorPay = await fetchJson('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` }, // User 2 trying to pay for User 1's appointment
      body: JSON.stringify({ appointmentId: appointment3Id })
    });
    assert(idorPay.status === 403, '5.2 Unauthorized customer cannot create payment for another customer (HTTP 403)');

    // 5.3 Signature Tamper Detection
    const tamperedVerify = await fetchJson('/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        appointmentId: appointment3Id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: 'pay_fake123456789',
        razorpay_signature: 'invalid_tampered_hex_signature_abc'
      })
    });
    assert(tamperedVerify.status === 400, '5.3 Tampered payment signature is rejected with HTTP 400');

    // 5.4 Valid Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET?.trim() || 'test_secret';
    const fakePaymentId = `pay_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${fakePaymentId}`)
      .digest('hex');

    const validVerify = await fetchJson('/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        appointmentId: appointment3Id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: validSignature,
        paymentMethod: 'card'
      })
    });
    assert(
      validVerify.status === 200 && validVerify.data.data?.paymentStatus === 'paid',
      '5.4 Valid HMAC cryptographic signature verifies and marks appointment as paid'
    );


    // ----------------------------------------------------------------
    // SECTION 6: REVIEWS & RATINGS TESTS
    // ----------------------------------------------------------------
    console.log('\n--- SECTION 6: REVIEWS & RATINGS TESTS ---');

    // 6.1 Cannot review uncompleted appointment
    const uncompletedReview = await fetchJson('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        appointmentId: appointment3Id,
        rating: 5,
        comment: 'Premature review attempt'
      })
    });
    assert(
      uncompletedReview.status === 400,
      '6.1 Customer cannot review an uncompleted appointment (HTTP 400)'
    );

    // 6.2 Admin marks appointment as completed
    const markComplete = await fetchJson(`/appointments/${appointment3Id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ status: 'completed' })
    });
    assert(markComplete.status === 200, '6.2 Admin marks appointment as completed');

    // 6.3 Customer reviews completed appointment
    const validReview = await fetchJson('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        appointmentId: appointment3Id,
        rating: 5,
        comment: 'Exceptional stylist service and ambiance!'
      })
    });
    assert(
      validReview.status === 201 && validReview.data.data?.rating === 5,
      '6.3 Customer submits verified 5-star review for completed appointment'
    );

    // 6.4 Prevent duplicate review
    const duplicateReview = await fetchJson('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` },
      body: JSON.stringify({
        appointmentId: appointment3Id,
        rating: 4,
        comment: 'Second review attempt'
      })
    });
    assert(
      duplicateReview.status === 409,
      '6.4 Duplicate review for the same appointment is rejected with HTTP 409'
    );

    // 6.5 Customer IDOR review check (User 2 trying to review User 1's appointment)
    const idorReview = await fetchJson('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser2}` },
      body: JSON.stringify({
        appointmentId: appointment3Id,
        rating: 1,
        comment: 'Malicious review on someone elses booking'
      })
    });
    assert(
      idorReview.status === 403,
      '6.5 Customer cannot review an appointment belonging to another customer (HTTP 403)'
    );

  } catch (err) {
    console.error('\nFATAL ERROR DURING TEST EXECUTION:', err);
  } finally {
    try {
      await User.deleteMany({ email: { $in: [testEmail1, testEmail2, testAdminEmail] } });
      if (appointment1Id) await Appointment.findByIdAndDelete(appointment1Id);
      if (appointment2Id) await Appointment.findByIdAndDelete(appointment2Id);
      if (appointment3Id) await Appointment.findByIdAndDelete(appointment3Id);
      await mongoose.disconnect();
    } catch (cleanupErr) {}
  }

  // Print final results
  printSummary();
}

runTestSuite();
