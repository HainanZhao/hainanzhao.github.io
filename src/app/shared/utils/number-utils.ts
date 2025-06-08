/**
 * Collection of number/math utility functions for developers
 */

/**
 * Rounds a number to a specified number of decimal places
 */
export function roundTo(num: number, decimals: number = 2): number {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
}

/**
 * Formats a number as currency (USD by default)
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Calculates the percentage of a value relative to a total
 */
export function calculatePercentage(value: number, total: number): number {
  return roundTo((value / total) * 100);
}

/**
 * Clamps a number between a minimum and maximum value
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Generates a random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Parse human readable bytes back to number
 */
export function parseBytes(str: string): number {
  const match = str.match(/^(\d+(?:\.\d+)?)\s*(bytes?|kb|mb|gb|tb|pb|eb|zb|yb)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  const sizes: Record<string, number> = {
    bytes: 1,
    byte: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
    pb: 1024 ** 5,
    eb: 1024 ** 6,
    zb: 1024 ** 7,
    yb: 1024 ** 8,
  };

  return value * (sizes[unit] || 1);
}

/**
 * Convert between number bases (2-36)
 */
export function convertBase(num: string, fromBase: number, toBase: number): string {
  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
    throw new Error('Base must be between 2 and 36');
  }

  // Convert to decimal first, then to target base
  const decimal = parseInt(num, fromBase);
  if (isNaN(decimal)) {
    throw new Error('Invalid number for the specified base');
  }

  return decimal.toString(toBase).toUpperCase();
}

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Calculate compound interest
 */
export function compoundInterest(
  principal: number,
  rate: number,
  time: number,
  frequency: number = 1
): number {
  return principal * Math.pow(1 + rate / frequency, frequency * time);
}

/**
 * Convert between different units
 */
export function convertUnits(value: number, fromUnit: string, toUnit: string): number {
  const conversions: Record<string, Record<string, number>> = {
    length: {
      mm: 1,
      cm: 10,
      m: 1000,
      km: 1000000,
      inch: 25.4,
      ft: 304.8,
      yard: 914.4,
      mile: 1609344,
    },
    weight: {
      mg: 1,
      g: 1000,
      kg: 1000000,
      oz: 28349.5,
      lb: 453592,
    },
    temperature: {
      // Special handling needed for temperature
    },
  };

  // Find the category
  let category = '';
  for (const [cat, units] of Object.entries(conversions)) {
    if (units[fromUnit] && units[toUnit]) {
      category = cat;
      break;
    }
  }

  if (!category) {
    throw new Error('Unsupported unit conversion');
  }

  if (category === 'temperature') {
    // Special temperature conversion logic
    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      return (value * 9) / 5 + 32;
    } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
      return ((value - 32) * 5) / 9;
    } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
      return value + 273.15;
    } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
      return value - 273.15;
    }
  }

  const baseValue = value * conversions[category][fromUnit];
  return baseValue / conversions[category][toUnit];
}

/**
 * Generate hash code for a number (useful for testing)
 */
export function hashCode(num: number): number {
  const str = num.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Check if a number is prime
 */
export function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }

  return true;
}

/**
 * Calculate greatest common divisor
 */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate least common multiple
 */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}
