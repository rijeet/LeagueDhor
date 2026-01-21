/**
 * Date utility functions for normalizing UTC dates to local timezone
 * 
 * All dates stored in the database are in UTC.
 * This utility converts them to local timezone (Bangladesh Standard Time, UTC+6)
 * before sending to the frontend.
 */

/**
 * Local timezone for the application (Bangladesh Standard Time)
 * Can be changed via environment variable TIMEZONE (default: Asia/Dhaka)
 */
const LOCAL_TIMEZONE = process.env.TIMEZONE || 'Asia/Dhaka';

/**
 * Converts a UTC Date object to local timezone ISO string with timezone offset
 * @param date - Date object (assumed to be in UTC)
 * @returns ISO string in local timezone with offset (e.g., "2026-01-21T20:41:00+06:00")
 */
export function toLocalTimeString(date: Date | null | undefined): string | null | undefined {
  if (!date) {
    return date as null | undefined;
  }

  // Use Intl.DateTimeFormat to format the date in the target timezone
  // This properly converts UTC to the specified timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: LOCAL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Format the date parts
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  const second = parts.find(p => p.type === 'second')?.value;

  // For Bangladesh (Asia/Dhaka), it's always UTC+6 (no daylight saving)
  // This can be made dynamic if needed, but for simplicity:
  const offset = '+06:00';

  // Construct the local time string
  const localTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;

  // Return as ISO format with timezone offset (YYYY-MM-DDTHH:mm:ss+06:00)
  // Frontend can parse this correctly and it will show the correct local time
  return localTimeString;
}

/**
 * Recursively transforms all Date objects in an object/array to local timezone strings
 * @param obj - Object or array to transform
 * @returns Transformed object with dates as local timezone strings
 */
export function normalizeDatesToLocal<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return toLocalTimeString(obj) as unknown as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeDatesToLocal(item)) as unknown as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as any)[key];
        if (value instanceof Date) {
          transformed[key] = toLocalTimeString(value);
        } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          transformed[key] = normalizeDatesToLocal(value);
        } else {
          transformed[key] = value;
        }
      }
    }
    return transformed as T;
  }

  // Primitive values (string, number, boolean, etc.)
  return obj;
}
