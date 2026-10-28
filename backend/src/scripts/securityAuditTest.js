/**
 * Focused Security Audit Test Suite
 * Validates error redaction, stack trace suppression, and secret validation
 */

import { errorHandler, notFoundHandler } from '../middlewares/errorHandler.js';
import { ApiError } from '../utils/apiError.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${testName} - ${details}`);
  }
}

console.log('\n======================================================');
console.log('   ENRICH SECURITY & ERROR REDACTION TEST SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------
// Test 1: Verify Stack Trace Redaction on Hosted / Non-Local Requests
// -----------------------------------------------------------------
console.log('Test Group 1: Error Handler Redaction');

const mockReqHosted = {
  method: 'GET',
  originalUrl: '/api/v1/invalid-route',
  hostname: 'www.enrichbeautysikar.in'
};

let capturedStatus = null;
let capturedJson = null;

const mockRes = {
  status(code) {
    capturedStatus = code;
    return this;
  },
  json(data) {
    capturedJson = data;
    return this;
  }
};

// Simulate hosted production request
process.env.RENDER = 'true';
const errorWithStack = new Error('Database query failure at D:\\Enrich\\backend\\src\\controllers\\test.js:42');
errorWithStack.stack = 'Error: Database query failure\n    at D:\\Enrich\\backend\\src\\controllers\\test.js:42:15';

errorHandler(errorWithStack, mockReqHosted, mockRes, () => {});

assert(capturedStatus === 500, 'Returns HTTP 500 for unhandled errors');
assert(capturedJson.stack === undefined, 'Suppresses stack trace on hosted environment');
assert(!capturedJson.message.includes('D:\\Enrich'), 'Strips raw filesystem paths from 500 error message');
assert(
  capturedJson.message === 'An unexpected server error occurred. Please try again later.',
  'Sanitizes 500 message to non-panicking customer-safe message'
);

// -----------------------------------------------------------------
// Test 2: Verify 404 Route Not Found Safety
// -----------------------------------------------------------------
console.log('\nTest Group 2: 404 Not Found Safety');

capturedStatus = null;
capturedJson = null;

notFoundHandler(mockReqHosted, mockRes, (err) => {
  errorHandler(err, mockReqHosted, mockRes, () => {});
});

assert(capturedStatus === 404, 'Returns HTTP 404 for missing routes');
assert(capturedJson.message === 'Route not found: GET /api/v1/invalid-route', 'Returns clean 404 route message');
assert(capturedJson.stack === undefined, 'No stack trace on 404 response');

// Clean up env
delete process.env.RENDER;

// -----------------------------------------------------------------
// Test 3: Path Stripping Utility Test
// -----------------------------------------------------------------
console.log('\nTest Group 3: Path Sanitization');

const apiErrWithPath = new ApiError(400, 'Invalid file at /var/www/uploads/avatar.png');
errorHandler(apiErrWithPath, mockReqHosted, mockRes, () => {});

assert(capturedStatus === 400, 'Preserves client status code 400');
assert(!capturedJson.message.includes('/var/www/uploads'), 'Replaces OS system paths with [internal-path]');

console.log('\n======================================================');
console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
