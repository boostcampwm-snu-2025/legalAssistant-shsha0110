import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * timeUtils.js
 * Handles all time-related calculations for the contract.
 * Uses 'dayjs' for robust date parsing and arithmetic.
 */

// Helper: Convert "HH:mm" string or Dayjs object to Dayjs object
export const toDayjs = (time) => {
    if (!time) return null;
    return dayjs(time, 'HH:mm'); // Assumes input format or Dayjs object
};

/**
 * Calculates the duration in minutes between start and end time.
 * Handles overnight shifts (e.g., 22:00 to 02:00) if needed.
 */
export const calculateDurationMinutes = (start, end) => {
    if (!start || !end) return 0;
    
    let s = toDayjs(start);
    let e = toDayjs(end);

    // If end time is before start time, assume it's the next day (Overnight)
    if (e.isBefore(s)) {
        e = e.add(1, 'day');
    }

    return e.diff(s, 'minute');
};

/**
 * Formats minutes into "X hours Y minutes" string.
 * Example: 90 -> "1시간 30분"
 */
export const formatDuration = (minutes) => {
  if (minutes <= 0) return '0시간';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
};

/**
 * Checks if the break time is legally sufficient.
 * Rule: 4 hours work -> 30 min break, 8 hours work -> 1 hour break.
 * * @param {number} workMinutes - Total time stayed (Start to End)
 * @param {number} breakMinutes - Break duration
 * @returns {string|null} Error message or null if valid
 */
export const validateBreakTime = (workMinutes, breakMinutes) => {
  // Real working time = Total stay - Break time
  const netWorkMinutes = workMinutes - breakMinutes;

  if (netWorkMinutes >= 480) { // 8 hours
    if (breakMinutes < 60) return "8시간 이상 근무 시 1시간 이상의 휴게시간이 필요합니다.";
  } else if (netWorkMinutes >= 240) { // 4 hours
    if (breakMinutes < 30) return "4시간 이상 근무 시 30분 이상의 휴게시간이 필요합니다.";
  }
  
  return null; // Valid
};