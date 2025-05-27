/**
 * Collection of number/math utility functions
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
    currency: currencyCode
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
