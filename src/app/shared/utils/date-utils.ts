/**
 * Collection of comprehensive date utility functions for developers
 */

/**
 * Formats a date using Intl.DateTimeFormat
 */
export function formatDate(
  date: Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Returns true if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Adds specified number of days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Returns the difference between two dates in days
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.round(diff / oneDay);
}

/**
 * Returns start of the day for given date
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Convert Unix timestamp to Date
 */
export function fromUnixTimestamp(timestamp: number): Date {
  // Handle both seconds and milliseconds timestamps
  return new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
}

/**
 * Convert Date to Unix timestamp (seconds)
 */
export function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Format date in ISO 8601 format
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO 8601 date string
 */
export function fromISOString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Format date in various common formats
 */
export function formatAs(date: Date, format: string): string {
  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    datetime: {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
    'date-only': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'time-only': { hour: '2-digit', minute: '2-digit' },
  };

  return new Intl.DateTimeFormat('en-US', formats[format] || formats['medium']).format(date);
}

/**
 * Get relative time (time ago/from now)
 */
export function getRelativeTime(date: Date, baseDate: Date = new Date()): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffInSeconds = (date.getTime() - baseDate.getTime()) / 1000;

  const intervals = [
    { unit: 'year' as Intl.RelativeTimeFormatUnit, seconds: 31536000 },
    { unit: 'month' as Intl.RelativeTimeFormatUnit, seconds: 2628000 },
    { unit: 'week' as Intl.RelativeTimeFormatUnit, seconds: 604800 },
    { unit: 'day' as Intl.RelativeTimeFormatUnit, seconds: 86400 },
    { unit: 'hour' as Intl.RelativeTimeFormatUnit, seconds: 3600 },
    { unit: 'minute' as Intl.RelativeTimeFormatUnit, seconds: 60 },
    { unit: 'second' as Intl.RelativeTimeFormatUnit, seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds > 0 ? count : -count, interval.unit);
    }
  }

  return rtf.format(0, 'second');
}

/**
 * Add time period to date
 */
export function addTime(
  date: Date,
  amount: number,
  unit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds'
): Date {
  const result = new Date(date);

  switch (unit) {
    case 'years':
      result.setFullYear(result.getFullYear() + amount);
      break;
    case 'months':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'weeks':
      result.setDate(result.getDate() + amount * 7);
      break;
    case 'days':
      result.setDate(result.getDate() + amount);
      break;
    case 'hours':
      result.setHours(result.getHours() + amount);
      break;
    case 'minutes':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 'seconds':
      result.setSeconds(result.getSeconds() + amount);
      break;
  }

  return result;
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(date: Date = new Date()): number {
  return -date.getTimezoneOffset() / 60;
}

/**
 * Format date in different timezones
 */
export function formatInTimezone(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return `Invalid timezone: ${timezone}`;
  }
}

/**
 * Validate if string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Parse flexible date input
 */
export function parseDate(input: string): Date | null {
  // Try various formats
  const formats = [
    input, // Original
    input.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, '$3-$1-$2'), // MM/DD/YYYY to YYYY-MM-DD
    input.replace(/(\d{1,2})-(\d{1,2})-(\d{4})/, '$3-$1-$2'), // MM-DD-YYYY to YYYY-MM-DD
    input.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'), // YYYYMMDD to YYYY-MM-DD
  ];

  for (const format of formats) {
    const date = new Date(format);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Get start and end of various time periods
 */
export function getStartOf(date: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
  const result = new Date(date);

  switch (period) {
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
      result.setDate(result.getDate() - result.getDay());
      result.setHours(0, 0, 0, 0);
      break;
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }

  return result;
}

export function getEndOf(date: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
  const result = new Date(date);

  switch (period) {
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'week':
      result.setDate(result.getDate() + (6 - result.getDay()));
      result.setHours(23, 59, 59, 999);
      break;
    case 'month':
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case 'year':
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      break;
  }

  return result;
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Get business days between two dates
 */
export function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}
