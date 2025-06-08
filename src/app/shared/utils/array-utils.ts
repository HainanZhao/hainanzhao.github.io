/**
 * Collection of array and object utility functions for advanced array manipulation
 */

/**
 * Groups an array of objects by a specified key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, currentValue) => {
      const groupKey = String(currentValue[key]);
      (result[groupKey] = result[groupKey] || []).push(currentValue);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Removes duplicate values from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Deep clones an object or array
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks if an object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Creates an array of numbers in range [start, end]
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Chunks an array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Flattens a nested array to specified depth
 */
export function flatten<T>(array: any[], depth: number = 1): T[] {
  return depth > 0
    ? array.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : array.slice();
}

/**
 * Finds the intersection of two arrays
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => array2.includes(item));
}

/**
 * Finds the difference between two arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item));
}

/**
 * Finds the union of two arrays (unique values from both)
 */
export function union<T>(array1: T[], array2: T[]): T[] {
  return unique([...array1, ...array2]);
}

/**
 * Zips two arrays together
 */
export function zip<T, U>(array1: T[], array2: U[]): [T, U][] {
  const length = Math.min(array1.length, array2.length);
  return Array.from({ length }, (_, i) => [array1[i], array2[i]]);
}

/**
 * Creates a frequency map of values in an array
 */
export function frequency<T>(array: T[]): Map<T, number> {
  const freqMap = new Map<T, number>();
  array.forEach(item => {
    freqMap.set(item, (freqMap.get(item) || 0) + 1);
  });
  return freqMap;
}

/**
 * Calculates statistical measures for numeric arrays
 */
export function statistics(array: number[]): {
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  sum: number;
} {
  if (array.length === 0) {
    throw new Error('Array cannot be empty');
  }

  const sorted = [...array].sort((a, b) => a - b);
  const sum = array.reduce((acc, val) => acc + val, 0);
  const mean = sum / array.length;

  // Median
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Mode
  const freqMap = frequency(array);
  const maxFreq = Math.max(...freqMap.values());
  const mode = Array.from(freqMap.entries())
    .filter(([, freq]) => freq === maxFreq)
    .map(([val]) => val);

  // Variance and standard deviation
  const variance = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
  const standardDeviation = Math.sqrt(variance);

  return {
    mean,
    median,
    mode,
    variance,
    standardDeviation,
    min: Math.min(...array),
    max: Math.max(...array),
    sum,
  };
}

/**
 * Finds outliers in a numeric array using IQR method
 */
export function findOutliers(array: number[]): {
  outliers: number[];
  bounds: { lower: number; upper: number };
  quartiles: { q1: number; q3: number; iqr: number };
} {
  if (array.length < 4) {
    throw new Error('Array must have at least 4 elements');
  }

  const sorted = [...array].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = array.filter(val => val < lowerBound || val > upperBound);

  return {
    outliers,
    bounds: { lower: lowerBound, upper: upperBound },
    quartiles: { q1, q3, iqr },
  };
}

/**
 * Calculates percentiles for a numeric array
 */
export function percentiles(
  array: number[],
  percentileValues: number[] = [10, 25, 50, 75, 90, 95, 99]
): Record<string, number> {
  if (array.length === 0) {
    throw new Error('Array cannot be empty');
  }

  const sorted = [...array].sort((a, b) => a - b);
  const result: Record<string, number> = {};

  percentileValues.forEach(p => {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    const value = sorted[lower] * (1 - weight) + sorted[upper] * weight;
    result[`p${p}`] = value;
  });

  return result;
}

/**
 * Generates an array of random numbers
 */
export function randomNumbers(count: number, min: number = 0, max: number = 100): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Generates an array of random strings
 */
export function randomStrings(count: number, length: number = 8): string[] {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: count }, () => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  });
}

/**
 * Generates Fibonacci sequence
 */
export function fibonacci(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];

  const result = [0, 1];
  for (let i = 2; i < count; i++) {
    result[i] = result[i - 1] + result[i - 2];
  }
  return result;
}

/**
 * Generates prime numbers
 */
export function primes(count: number): number[] {
  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const result: number[] = [];
  let num = 2;
  while (result.length < count) {
    if (isPrime(num)) result.push(num);
    num++;
  }
  return result;
}

/**
 * Rotates array elements by n positions
 */
export function rotate<T>(array: T[], positions: number): T[] {
  const len = array.length;
  if (len === 0) return array;

  const normalizedPos = ((positions % len) + len) % len;
  return [...array.slice(normalizedPos), ...array.slice(0, normalizedPos)];
}

/**
 * Partitions array into two arrays based on predicate function
 */
export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];

  array.forEach(item => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });

  return [truthy, falsy];
}
