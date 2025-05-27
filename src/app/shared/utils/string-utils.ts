/**
 * Collection of string utility functions
 */

/**
 * Capitalizes the first letter of each word in a string
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => 
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Converts a string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    .replace(/^_/, '');
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Removes all special characters from a string
 */
export function removeSpecialCharacters(str: string): string {
  return str.replace(/[^a-zA-Z0-9 ]/g, '');
}
