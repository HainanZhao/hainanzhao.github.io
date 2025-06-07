import alasql from 'alasql';

export interface QueryResult {
  data: Record<string, unknown>[];
  error?: string;
  executionTime?: number;
}

/**
 * Preprocesses the SQL query to handle unquoted property paths with dot notation
 * Converts company.name to company->name for AlaSQL's native property access
 * Quoted strings are treated as regular string literals and not processed
 * @param query The original SQL query
 * @returns The processed SQL query
 */
export function preprocessSqlQuery(query: string): string {
  // Process unquoted property paths with dot notation
  // This approach uses a context-aware strategy:
  // 1. We avoid modifying dot notation right after FROM, JOIN as those are likely table aliases
  // 2. We look for patterns like "word.word" that are likely property paths
  // 3. We preserve quoted strings as regular string literals

  // Split into contexts: SELECT, FROM, WHERE, etc.
  const sqlParts = query.split(/\b(FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|ON)\b/i);

  // Process each part separately to maintain context awareness
  for (let i = 0; i < sqlParts.length; i++) {
    const part = sqlParts[i];
    const upperPart = part.trim().toUpperCase();

    // Skip processing the SQL keywords themselves
    if (['FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'ON'].includes(upperPart)) {
      continue;
    }

    // Don't process the part right after FROM or JOIN as it's likely a table reference
    if (i > 0 && ['FROM', 'JOIN'].includes(sqlParts[i - 1].trim().toUpperCase())) {
      continue;
    }

    // Process other parts for property path patterns (word.word)
    // This regex matches patterns like "field.name" but not string literals like 'text.more'
    sqlParts[i] = part.replace(/\b(\w+)\.(\w+)(\.\w+)*\b(?!'|")/g, match => {
      return match.replace(/\./g, '->');
    });
  }

  return sqlParts.join('');
}

/**
 * Configures AlaSQL to properly handle nested object properties
 * This ensures both dot notation (obj.prop.subprop) and arrow notation (obj->prop->subprop)
 * work correctly in queries
 */
export function configureAlaSqlForNestedProperties(): void {
  // Add a custom function to access nested properties using a string path
  // @ts-expect-error - alasql.fn has an index signature for custom functions
  alasql.fn.getNestedValue = function (obj: Record<string, unknown>, path: string): unknown {
    if (!obj || !path) return undefined;

    const parts = path.split('.');
    let current = obj as unknown as Record<string, unknown>;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part] as unknown as Record<string, unknown>;
    }

    return current;
  };

  // Register the -> operator for property access if it doesn't exist
  try {
    // Define a custom operator for -> to access nested properties
    alasql('CREATE FUNCTION ARROW(a,b) RETURNS a[b]');
    alasql('CREATE OPERATOR -> AS ARROW');
  } catch {
    // If operator already exists or can't be created, we'll still have the flattened properties
    console.log('Arrow operator already exists or could not be defined');
  }
}

/**
 * Flattens a nested object into a single-level object with dot notation keys
 * Example: { a: { b: 1 } } becomes { 'a.b': 1 }
 */
export function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};

  Object.keys(obj).forEach(key => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      // Add the flattened property
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * Transforms the input data by adding flattened properties
 * This preserves the original structure while adding flattened access
 */
export function transformDataForNestedQueries(
  data: Record<string, unknown>[]
): Record<string, unknown>[] {
  return data.map(item => {
    const flattened = flattenObject(item);
    // Return original item with flattened properties merged in
    return { ...item, ...flattened };
  });
}

/**
 * Formats a cell value for display in the table
 * Handles nested objects, arrays, and other complex types
 */
export function formatTableCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    // For objects and arrays, show a simplified JSON representation
    return JSON.stringify(value);
  }

  // For primitive values, just convert to string
  return String(value);
}

/**
 * Formats query results as JSON string with proper indentation
 */
export function formatJsonQueryOutput(data: Record<string, unknown>[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Gets the column names from query result data
 */
export function getQueryResultKeys(data: Record<string, unknown>[]): string[] {
  if (data.length === 0) {
    return [];
  }
  return Object.keys(data[0]);
}

/**
 * Copies query results to clipboard
 */
export function copyQueryResults(
  data: Record<string, unknown>[],
  format: 'table' | 'json' = 'table'
): void {
  const textToCopy = format === 'json' ? formatJsonQueryOutput(data) : JSON.stringify(data);

  navigator.clipboard
    .writeText(textToCopy)
    .catch(err => console.error('Failed to copy text: ', err));
}
