/**
 * Date and Time Utilities for Enrich Salon Booking
 */

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a time slot has already passed for a given date.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {string} slotTimeStr - 'HH:MM' (24-hour format e.g. '14:30')
 * @param {number} bufferMinutes - Minimum advance notice required (default: 15 mins)
 * @returns {boolean} true if the slot is in the past
 */
export function isSlotPassed(dateStr, slotTimeStr, bufferMinutes = 15) {
  if (!dateStr || !slotTimeStr) return false;

  const todayStr = getTodayDateString();

  // If the booking date is strictly in the past, all slots are passed
  if (dateStr < todayStr) return true;

  // If the booking date is strictly in the future, slots are not passed
  if (dateStr > todayStr) return false;

  // It is today: check hours and minutes against current time + buffer
  const now = new Date();
  const [slotHrs, slotMins] = slotTimeStr.split(':').map(Number);
  const slotMinutes = (slotHrs || 0) * 60 + (slotMins || 0);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slotMinutes <= currentMinutes + bufferMinutes;
}
