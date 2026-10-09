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
 * Get current date, time, and minutes in Salon Timezone (Asia/Kolkata, UTC+5:30)
 */
export const getSalonNow = () => {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const map = {};
    parts.forEach((p) => (map[p.type] = p.value));
    const year = parseInt(map.year, 10);
    const month = parseInt(map.month, 10) - 1;
    const day = parseInt(map.day, 10);
    const hours = parseInt(map.hour, 10);
    const minutes = parseInt(map.minute, 10);
    const seconds = parseInt(map.second, 10);
    const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      now: new Date(year, month, day, hours, minutes, seconds),
      todayStr,
      hours,
      minutes,
      minutesFromMidnight: hours * 60 + minutes
    };
  } catch {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return {
      now,
      todayStr: now.toISOString().split('T')[0],
      hours,
      minutes,
      minutesFromMidnight: hours * 60 + minutes
    };
  }
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

  const { todayStr, minutesFromMidnight } = getSalonNow();

  // 1. Validate Date (Prevent querying past dates)
  if (date < todayStr) {
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

  const selectedDate = new Date(`${date}T00:00:00`);
  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[dayOfWeek];

  const isSelectedDateToday = date === todayStr;
  const MINIMUM_NOTICE_MINUTES = 15; // 15-minute advance window

  const slotMap = new Map(); // Key: "09:30" -> Value: { time, availableStaff: [] }

  // 4. Compute slots for each eligible staff member
  for (const staffMember of staffList) {
    // Check schedule for day of week
    const shift = staffMember.schedule?.find((s) => s.dayOfWeek === dayOfWeek);

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

      // Rule D: Check if slot has already passed for Today
      const isPassedSlot = isSelectedDateToday && (slotStart <= minutesFromMidnight + MINIMUM_NOTICE_MINUTES);

      const timeString = minutesToTime(slotStart);
      const endTimeString = minutesToTime(slotEnd);

      if (!slotMap.has(timeString)) {
        slotMap.set(timeString, {
          time: timeString,
          endTime: endTimeString,
          isPassed: isPassedSlot,
          availableStaff: []
        });
      }

      // If slot is valid, open, and not in the past, add available staff
      if (!isPassedSlot && !hasConflict) {
        slotMap.get(timeString).availableStaff.push({
          _id: staffMember._id,
          name: staffMember.name,
          avatar: staffMember.avatar?.url
        });
      }
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
