import alasql from 'alasql';

export interface QueryResult {
  data: Record<string, unknown>[];
  error?: string;
  executionTime?: number;
}

export function preprocessSqlQuery(query: string): string {
  // First handle reserved keyword aliases
  const processedQuery = handleReservedKeywordAliases(query);

  // Process unquoted property paths with dot notation
  // This approach uses a context-aware strategy:
  // 1. We avoid modifying dot notation right after FROM, JOIN as those are likely table aliases
  // 2. We look for patterns like "word.word" that are likely property paths
  // 3. We preserve quoted strings as regular string literals

  // Split into contexts: SELECT, FROM, WHERE, etc.
  const sqlParts = processedQuery.split(/\b(FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|ON)\b/i);

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
 * Handles reserved keyword conflicts in SQL aliases by quoting them
 * @param query The SQL query string
 * @returns The query with potentially conflicting aliases quoted
 */
function handleReservedKeywordAliases(query: string): string {
  // Common SQL reserved keywords that might be used as aliases
  const reservedKeywords = [
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
    'TOTAL',
    'VALUE',
    'VALUES',
    'KEY',
    'KEYS',
    'INDEX',
    'ORDER',
    'GROUP',
    'HAVING',
    'WHERE',
    'SELECT',
    'FROM',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'DROP',
    'ALTER',
    'TABLE',
    'DATABASE',
    'SCHEMA',
    'PRIMARY',
    'FOREIGN',
    'UNIQUE',
    'NOT',
    'NULL',
    'DEFAULT',
    'CHECK',
    'CONSTRAINT',
    'REFERENCES',
    'CASCADE',
    'RESTRICT',
    'SET',
    'ACTION',
    'MATCH',
    'PARTIAL',
    'FULL',
    'SIMPLE',
    'INITIALLY',
    'DEFERRED',
    'IMMEDIATE',
    'DEFERRABLE',
    'TRANSACTION',
    'COMMIT',
    'ROLLBACK',
    'SAVEPOINT',
    'RELEASE',
    'START',
    'BEGIN',
    'END',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'IF',
    'WHILE',
    'FOR',
    'LOOP',
    'REPEAT',
    'UNTIL',
    'RETURN',
    'FUNCTION',
    'PROCEDURE',
    'TRIGGER',
    'VIEW',
    'MATERIALIZED',
    'TEMPORARY',
    'TEMP',
    'GLOBAL',
    'LOCAL',
    'SESSION',
    'SYSTEM',
    'USER',
    'CURRENT',
    'TIMESTAMP',
    'DATE',
    'TIME',
    'INTERVAL',
    'YEAR',
    'MONTH',
    'DAY',
    'HOUR',
    'MINUTE',
    'SECOND',
    'ZONE',
    'EXTRACT',
    'POSITION',
    'SUBSTRING',
    'TRIM',
    'UPPER',
    'LOWER',
    'LENGTH',
    'CHAR',
    'VARCHAR',
    'TEXT',
    'BOOLEAN',
    'INTEGER',
    'DECIMAL',
    'NUMERIC',
    'REAL',
    'DOUBLE',
    'PRECISION',
    'SMALLINT',
    'BIGINT',
    'SERIAL',
    'AUTOINCREMENT',
    'IDENTITY',
    'GENERATED',
    'ALWAYS',
    'BY',
    'AS',
    'STORED',
    'VIRTUAL',
    'COLUMN',
    'COLUMNS',
    'ROW',
    'ROWS',
    'FIRST',
    'LAST',
    'NEXT',
    'PRIOR',
    'ABSOLUTE',
    'RELATIVE',
    'FORWARD',
    'BACKWARD',
    'SCROLL',
    'INSENSITIVE',
    'ASENSITIVE',
    'CURSOR',
    'OPEN',
    'CLOSE',
    'FETCH',
    'MOVE',
    'DECLARE',
    'ALLOCATE',
    'DEALLOCATE',
    'PREPARE',
    'EXECUTE',
    'IMMEDIATE',
    'DESCRIBE',
    'EXCEPTION',
    'SIGNAL',
    'RESIGNAL',
    'UNDO',
    'HANDLER',
    'CONTINUE',
    'EXIT',
    'CONDITION',
    'SQLSTATE',
    'SQLCODE',
    'SQLERROR',
    'SQLWARNING',
    'FOUND',
    'GOTO',
    'LEAVE',
    'ITERATE',
    'CALL',
    'DYNAMIC',
    'SQL',
    'DESCRIPTOR',
    'AREA',
    'GET',
    'PUT',
    'USING',
    'INTO',
    'BULK',
    'COLLECT',
    'FORALL',
    'SAVE',
    'EXCEPTIONS',
    'INDICES',
    'BETWEEN',
    'CURSOR_NAME',
    'SQLEXCEPTION',
  ];

  // Create a set for faster lookup
  const reservedSet = new Set(reservedKeywords.map(k => k.toUpperCase()));

  // Regex to match AS/as followed by an identifier
  // This captures: AS identifier or as identifier
  const aliasRegex = /\b(AS|as)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;

  return query.replace(aliasRegex, (match, asKeyword, identifier) => {
    // Check if the identifier is a reserved keyword
    if (reservedSet.has(identifier.toUpperCase())) {
      // Quote it with square brackets for AlaSQL
      return `${asKeyword} [${identifier}]`;
    }
    // Return unchanged if not a reserved keyword
    return match;
  });
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
