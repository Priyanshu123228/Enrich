import { Staff } from '../models/Staff.js';
import { Service } from '../models/Service.js';
import { Appointment } from '../models/Appointment.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Convert time string ("09:30") to minutes from midnight (570)
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes from midnight (570) to time string ("09:30")
 */
export const minutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Add minutes to a time string
 */
export const calculateEndTime = (startTimeStr, durationMinutes) => {
  const startMins = timeToMinutes(startTimeStr);
  const endMins = startMins + durationMinutes;
  return minutesToTime(endMins);
};

/**
 * Check if two time intervals overlap:
 * Overlap occurs if max(start1, start2) < min(end1, end2)
 */
export const isIntervalOverlap = (start1, end1, start2, end2) => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

/**
 * Generate available time slots for a given service, staff member, and date
 * 
 * @param {Object} params
 * @param {string} params.serviceId - ID of selected service
 * @param {string} params.staffId - ID of selected staff member or 'any'
 * @param {string} params.date - "YYYY-MM-DD"
 */
export const getAvailableSlots = async ({ serviceId, staffId, date }) => {
  if (!serviceId || !date) {
    throw new ApiError(400, 'Service ID and Date are required to query slots');
  }

  // 1. Validate Date (Prevent querying past dates)
  const selectedDate = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return {
      date,
      dayName: '',
      isSalonClosed: true,
      reason: 'Cannot book appointments for past dates',
      availableSlots: []
    };
  }

  // 2. Fetch Service details
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Service not found or inactive');
  }

  const duration = service.duration;
  const buffer = service.bufferTimeMinutes || 10;
  const totalBlockRequired = duration + buffer; // Time needed for treatment + sterilization

  // 3. Find target Staff members
  let staffList = [];
  if (staffId && staffId !== 'any') {
    const singleStaff = await Staff.findOne({ _id: staffId, status: 'active' });
    if (!singleStaff) {
      throw new ApiError(404, 'Selected stylist is currently unavailable');
    }
    staffList = [singleStaff];
  } else {
    // If 'any' is selected, find all active staff who offer this service
    staffList = await Staff.find({
      status: 'active',
      services: serviceId
    });

    if (staffList.length === 0) {
      // Fallback: any active staff
      staffList = await Staff.find({ status: 'active' });
    }
  }

  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[dayOfWeek];

  // Current time reference for today's past slot filtering
  const now = new Date();
  const isSelectedDateToday =
    today.getFullYear() === selectedDate.getFullYear() &&
    today.getMonth() === selectedDate.getMonth() &&
    today.getDate() === selectedDate.getDate();

  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();
  const MINIMUM_NOTICE_MINUTES = 20; // 20-min buffer for immediate walk-in/online bookings

  const slotMap = new Map(); // Key: "09:30" -> Value: { time, availableStaff: [] }

  // 4. Compute slots for each eligible staff member
  for (const staffMember of staffList) {
    // Check schedule for day of week
    const shift = staffMember.schedule.find((s) => s.dayOfWeek === dayOfWeek);

    if (!shift || !shift.isWorking) {
      continue; // Staff is off today
    }

    // Check custom leave exceptions
    const isExceptionOff = staffMember.exceptions?.some(
      (exc) => exc.date === date && exc.isOff
    );
    if (isExceptionOff) {
      continue;
    }

    const shiftStart = timeToMinutes(shift.startTime || '09:00');
    const shiftEnd = timeToMinutes(shift.endTime || '19:00');
    const breakStart = timeToMinutes(shift.breakStartTime || '13:00');
    const breakEnd = timeToMinutes(shift.breakEndTime || '14:00');

    // Fetch existing confirmed/pending appointments for this staff on this date
    const existingAppointments = await Appointment.find({
      staff: staffMember._id,
      date,
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime duration');

    const bookedIntervals = existingAppointments.map((app) => ({
      start: timeToMinutes(app.startTime),
      end: timeToMinutes(app.endTime) + buffer // Include buffer time after appointment
    }));

    // Step through shift in 30-minute intervals
    const STEP_MINUTES = 30;
    for (let slotStart = shiftStart; slotStart + duration <= shiftEnd; slotStart += STEP_MINUTES) {
      const slotEnd = slotStart + duration;
      const slotBlockEnd = slotStart + totalBlockRequired;

      // Rule A: Slot + Duration cannot exceed Shift End Time
      if (slotEnd > shiftEnd) continue;

      // Rule B: Cannot overlap with Staff Break Window
      if (breakStart && breakEnd && isIntervalOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
        continue;
      }

      // Rule C: Cannot overlap with existing appointments (including buffer)
      const hasConflict = bookedIntervals.some((b) =>
        isIntervalOverlap(slotStart, slotBlockEnd, b.start, b.end)
      );
      if (hasConflict) {
        continue;
      }

      // Rule D: If booking for Today, exclude slots that have already passed
      if (isSelectedDateToday) {
        if (slotStart <= currentMinutesFromMidnight + MINIMUM_NOTICE_MINUTES) {
          continue;
        }
      }

      const timeString = minutesToTime(slotStart);
      const endTimeString = minutesToTime(slotEnd);

      if (!slotMap.has(timeString)) {
        slotMap.set(timeString, {
          time: timeString,
          endTime: endTimeString,
          availableStaff: []
        });
      }

      slotMap.get(timeString).availableStaff.push({
        _id: staffMember._id,
        name: staffMember.name,
        avatar: staffMember.avatar?.url
      });
    }
  }

  // Sort slots chronologically
  const availableSlots = Array.from(slotMap.values()).sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  return {
    date,
    dayName,
    service: {
      _id: service._id,
      name: service.name,
      duration: service.duration,
      price: service.discountPrice > 0 ? service.discountPrice : service.price
    },
    totalSlots: availableSlots.length,
    availableSlots
  };
};

/**
 * Validate collision before saving an appointment
 */
export const checkSlotCollision = async ({ staffId, date, startTime, duration, excludeAppointmentId }) => {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + duration;
  const endTime = minutesToTime(endMins);

  const query = {
    staff: staffId,
    date,
    status: { $in: ['pending', 'confirmed'] }
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const existing = await Appointment.find(query);

  const isCollision = existing.some((app) => {
    const existingStart = timeToMinutes(app.startTime);
    const existingEnd = timeToMinutes(app.endTime);
    return isIntervalOverlap(startMins, endMins, existingStart, existingEnd);
  });

  return { isCollision, endTime };
};
