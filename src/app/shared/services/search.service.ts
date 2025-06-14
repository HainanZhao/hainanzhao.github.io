import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  component: string;
  route: string;
  section: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchableItems: SearchableItem[] = [
    // Calculator features
    {
      id: 'calc-basic',
      title: 'Basic Calculator',
      description:
        'Perform basic arithmetic operations like addition, subtraction, multiplication, and division',
      keywords: [
        'calculator',
        'math',
        'arithmetic',
        'add',
        'subtract',
        'multiply',
        'divide',
        'plus',
        'minus',
      ],
      component: 'CalculatorComponent',
      route: '/calculator',
      section: 'basic-operations',
      category: 'Calculator',
    },

    // String Utils features
    {
      id: 'string-case',
      title: 'Case Converter',
      description:
        'Convert text between different cases: uppercase, lowercase, camelCase, PascalCase, kebab-case, snake_case',
      keywords: [
        'case',
        'convert',
        'uppercase',
        'lowercase',
        'camel',
        'pascal',
        'kebab',
        'snake',
        'text',
        'string',
      ],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'case-conversion',
      category: 'String Utils',
    },
    {
      id: 'text-analysis',
      title: 'Text Analysis',
      description:
        'Analyze text properties: character count, word count, reading time, common words',
      keywords: [
        'text',
        'analysis',
        'count',
        'characters',
        'words',
        'sentences',
        'reading',
        'time',
        'frequency',
      ],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'text-analysis',
      category: 'String Utils',
    },
    {
      id: 'text-manipulation',
      title: 'Text Manipulation',
      description:
        'Find and replace, reverse text, remove spaces, sort lines, remove duplicates, extract data',
      keywords: [
        'find',
        'replace',
        'reverse',
        'sort',
        'duplicate',
        'extract',
        'email',
        'url',
        'number',
        'manipulation',
      ],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'text-manipulation',
      category: 'String Utils',
    },
    {
      id: 'encoding-decoding',
      title: 'Encoding & Decoding',
      description: 'Encode and decode text using Base64, URL encoding, HTML entities',
      keywords: ['encode', 'decode', 'base64', 'url', 'html', 'entities', 'encoding'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'encoding-decoding',
      category: 'String Utils',
    },
    {
      id: 'hash-generation',
      title: 'Hash Generation',
      description: 'Generate cryptographic hashes like SHA-256 and MD5',
      keywords: ['hash', 'sha', 'md5', 'crypto', 'checksum', 'digest'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'hash-generation',
      category: 'String Utils',
    },
    {
      id: 'qr-code-generator',
      title: 'QR Code Generator',
      description: 'Generate QR codes from text with customizable size and error correction levels',
      keywords: ['qr', 'qr code', 'generate', 'barcode', 'scan', 'mobile', 'link', 'url', 'text'],
      component: 'QrCodeComponent',
      route: '/qr-code',
      section: 'qr-code-generator',
      category: 'QR Code',
    },
    {
      id: 'password-generator',
      title: 'Password Generator',
      description: 'Generate secure passwords with customizable length and character types',
      keywords: [
        'password',
        'generate',
        'random',
        'secure',
        'uppercase',
        'lowercase',
        'numbers',
        'symbols',
      ],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'password-generator',
      category: 'String Utils',
    },
    // CSV Utils features
    {
      id: 'csv-converter',
      title: 'CSV Converter',
      description: 'Convert CSV to different formats: tabs, JSON, SQL, HTML, XML, Markdown',
      keywords: ['csv', 'convert', 'json', 'sql', 'html', 'xml', 'markdown', 'format', 'export'],
      component: 'CsvToSheetsFormatterComponent',
      route: '/csv-formatter',
      section: 'csv-conversion',
      category: 'CSV Utils',
    },
    {
      id: 'csv-analysis',
      title: 'CSV Analysis',
      description: 'Analyze CSV data: row/column counts, data types, headers detection',
      keywords: ['csv', 'analysis', 'statistics', 'rows', 'columns', 'data', 'types', 'headers'],
      component: 'CsvToSheetsFormatterComponent',
      route: '/csv-formatter',
      section: 'csv-analysis',
      category: 'CSV Utils',
    },
    {
      id: 'csv-manipulation',
      title: 'CSV Data Manipulation',
      description: 'Sort, filter, remove duplicates, transpose CSV data',
      keywords: ['csv', 'sort', 'filter', 'duplicate', 'transpose', 'manipulation', 'data'],
      component: 'CsvToSheetsFormatterComponent',
      route: '/csv-formatter',
      section: 'csv-manipulation',
      category: 'CSV Utils',
    },

    // Date Utils features
    {
      id: 'date-formatting',
      title: 'Date Formatting',
      description:
        'Format dates in various styles: short, medium, long, full, time-only, date-only',
      keywords: ['date', 'format', 'style', 'display', 'short', 'medium', 'long', 'full', 'time'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'date-formatting',
      category: 'Date Utils',
    },
    {
      id: 'unix-timestamp',
      title: 'Unix Timestamp Conversion',
      description: 'Convert between Unix timestamps and human-readable dates',
      keywords: ['unix', 'timestamp', 'epoch', 'seconds', 'milliseconds', 'convert', 'time'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'timestamp-conversion',
      category: 'Date Utils',
    },
    {
      id: 'iso-string',
      title: 'ISO 8601 String Conversion',
      description: 'Convert between ISO 8601 date strings and Date objects',
      keywords: ['iso', '8601', 'string', 'standard', 'convert', 'format', 'international'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'iso-conversion',
      category: 'Date Utils',
    },
    {
      id: 'relative-time',
      title: 'Relative Time Calculation',
      description: 'Calculate and display relative time (2 hours ago, in 3 days, etc.)',
      keywords: ['relative', 'time', 'ago', 'from now', 'duration', 'difference', 'human'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'relative-time',
      category: 'Date Utils',
    },
    {
      id: 'date-validation',
      title: 'Date Validation & Parsing',
      description: 'Validate dates and parse flexible date formats',
      keywords: ['validate', 'parse', 'flexible', 'format', 'check', 'valid', 'invalid'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'date-validation',
      category: 'Date Utils',
    },
    {
      id: 'timezone-operations',
      title: 'Timezone Operations',
      description: 'Format dates in different timezones around the world',
      keywords: ['timezone', 'tz', 'utc', 'america', 'europe', 'asia', 'convert', 'zone'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'timezone-operations',
      category: 'Date Utils',
    },
    {
      id: 'add-time',
      title: 'Add Time Periods',
      description: 'Add years, months, weeks, days, hours, minutes, or seconds to dates',
      keywords: [
        'add',
        'subtract',
        'time',
        'period',
        'years',
        'months',
        'days',
        'hours',
        'minutes',
      ],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'add-time',
      category: 'Date Utils',
    },
    {
      id: 'period-boundaries',
      title: 'Period Boundaries',
      description: 'Get start and end of weeks, months, and years',
      keywords: ['start', 'end', 'period', 'week', 'month', 'year', 'boundary', 'range'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'period-boundaries',
      category: 'Date Utils',
    },
    {
      id: 'business-days',
      title: 'Business Days Calculation',
      description: 'Calculate business days, check weekends, exclude holidays',
      keywords: ['business', 'days', 'weekday', 'weekend', 'working', 'holiday', 'calculate'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'business-days',
      category: 'Date Utils',
    },

    // Number Utils features
    {
      id: 'byte-conversion',
      title: 'Byte Conversion',
      description: 'Convert between bytes and human-readable sizes (KB, MB, GB, TB)',
      keywords: ['byte', 'size', 'convert', 'kb', 'mb', 'gb', 'tb', 'storage', 'file size'],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'byte-conversion',
      category: 'Number Utils',
    },
    {
      id: 'number-base-conversion',
      title: 'Number Base Conversion',
      description: 'Convert numbers between different bases: binary, decimal, hexadecimal, octal',
      keywords: ['number', 'base', 'binary', 'decimal', 'hex', 'hexadecimal', 'octal', 'convert'],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'base-conversion',
      category: 'Number Utils',
    },
    {
      id: 'number-formatting',
      title: 'Number Formatting',
      description: 'Format numbers according to different locales and currency standards',
      keywords: ['number', 'format', 'locale', 'currency', 'internationalization', 'i18n'],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'number-formatting',
      category: 'Number Utils',
    },
    {
      id: 'unit-conversion',
      title: 'Unit Conversion',
      description: 'Convert between different units of measurement (length, weight, temperature)',
      keywords: [
        'unit',
        'convert',
        'length',
        'weight',
        'temperature',
        'meter',
        'foot',
        'kg',
        'pound',
      ],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'unit-conversion',
      category: 'Number Utils',
    },
    {
      id: 'duration-formatting',
      title: 'Duration Formatting',
      description: 'Convert milliseconds to human-readable duration formats',
      keywords: ['duration', 'time', 'format', 'milliseconds', 'seconds', 'minutes', 'hours'],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'duration-formatting',
      category: 'Number Utils',
    },
    {
      id: 'math-operations',
      title: 'Advanced Math Operations',
      description: 'Calculate GCD, LCM, check prime numbers, and other mathematical operations',
      keywords: ['math', 'gcd', 'lcm', 'prime', 'greatest common divisor', 'least common multiple'],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'math-operations',
      category: 'Number Utils',
    },
    {
      id: 'financial-calculations',
      title: 'Financial Calculations',
      description: 'Calculate compound interest, present value, and other financial operations',
      keywords: [
        'financial',
        'compound',
        'interest',
        'investment',
        'finance',
        'money',
        'principal',
      ],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'financial-calculations',
      category: 'Number Utils',
    },

    // Array Utils features
    {
      id: 'array-manipulation',
      title: 'Array Manipulation',
      description: 'Sort, filter, remove duplicates, find statistics in arrays',
      keywords: ['array', 'sort', 'filter', 'duplicate', 'statistics', 'manipulation'],
      component: 'ArrayUtilsComponent',
      route: '/array-utils',
      section: 'array-manipulation',
      category: 'Array Utils',
    },

    // JSON Visualizer features
    {
      id: 'json-visualizer',
      title: 'JSON Visualizer',
      description: 'Visualize JSON data with interactive tree, bubble, and network diagrams',
      keywords: ['json', 'visualize', 'tree', 'bubble', 'network', 'diagram', 'chart'],
      component: 'JsonVisualizerComponent',
      route: '/json-visualizer',
      section: 'json-visualization',
      category: 'JSON Visualizer',
    },

    // Regex Tester features
    {
      id: 'regex-tester',
      title: 'Regex Tester',
      description: 'Test regular expressions with match highlighting and capture groups',
      keywords: ['regex', 'regular', 'expression', 'pattern', 'match', 'test', 'validation'],
      component: 'RegexTesterComponent',
      route: '/regex-tester',
      section: 'regex-testing',
      category: 'Regex Tester',
    },

    // Iframe Performance features
    {
      id: 'iframe-performance-monitor',
      title: 'Performance Monitoring',
      description: 'Real-time FPS monitoring for main thread and iframe performance',
      keywords: ['iframe', 'performance', 'fps', 'monitoring', 'main thread', 'frame rate'],
      component: 'IframePerformanceComponent',
      route: '/iframe-performance',
      section: 'monitoring',
      category: 'Iframe Performance',
    },
    {
      id: 'iframe-performance-tests',
      title: 'Performance Tests',
      description:
        'Test iframe isolation with CPU-intensive, DOM manipulation, animation, memory, and network tests',
      keywords: [
        'iframe',
        'cpu',
        'dom',
        'animation',
        'memory',
        'network',
        'isolation',
        'thread blocking',
      ],
      component: 'IframePerformanceComponent',
      route: '/iframe-performance',
      section: 'tests',
      category: 'Iframe Performance',
    },
    {
      id: 'iframe-performance-results',
      title: 'Performance Analysis',
      description:
        'Analyze test results to understand iframe performance impact and thread isolation',
      keywords: [
        'iframe',
        'analysis',
        'results',
        'frame drops',
        'thread',
        'isolation',
        'performance impact',
      ],
      component: 'IframePerformanceComponent',
      route: '/iframe-performance',
      section: 'results',
      category: 'Iframe Performance',
    },
    // JSON Query features
    {
      id: 'json-query-main',
      title: 'SQL-like JSON Query',
      description: 'Query JSON data using SQL-like syntax for filtering and transforming data',
      keywords: [
        'json',
        'sql',
        'query',
        'filter',
        'search',
        'data',
        'select',
        'where',
        'group by',
        'order by',
      ],
      component: 'JsonQueryComponent',
      route: '/json-query',
      section: 'json-input',
      category: 'Data Processing',
    },
    {
      id: 'json-query-sql',
      title: 'SQL Query for JSON',
      description: 'Write SQL queries to filter, transform, and analyze JSON data structures',
      keywords: [
        'sql',
        'json',
        'query',
        'filter',
        'where clause',
        'select',
        'conditions',
        'data analysis',
      ],
      component: 'JsonQueryComponent',
      route: '/json-query',
      section: 'sql-query',
      category: 'Data Processing',
    },
    {
      id: 'json-query-results',
      title: 'JSON Query Results',
      description: 'View and analyze results from SQL queries on JSON data in table or JSON format',
      keywords: ['results', 'output', 'table', 'json', 'data', 'query results', 'formatted output'],
      component: 'JsonQueryComponent',
      route: '/json-query',
      section: 'query-results',
      category: 'Data Processing',
    },

    // Diff Viewer features
    {
      id: 'diff-viewer-main',
      title: 'Text Diff Viewer',
      description:
        'Compare and visualize differences between two text documents with line-by-line comparison',
      keywords: [
        'diff',
        'compare',
        'text',
        'difference',
        'file',
        'comparison',
        'changes',
        'viewer',
      ],
      component: 'DiffViewerComponent',
      route: '/diff-viewer',
      section: 'text-comparison',
      category: 'Development',
    },
    {
      id: 'diff-viewer-json',
      title: 'JSON Diff Comparison',
      description: 'Compare JSON objects and arrays with structured formatting and highlighting',
      keywords: ['json', 'diff', 'compare', 'object', 'array', 'structure', 'api', 'data'],
      component: 'DiffViewerComponent',
      route: '/diff-viewer',
      section: 'text-comparison',
      category: 'Development',
    },
    {
      id: 'diff-viewer-code',
      title: 'Code Diff Analysis',
      description: 'Analyze code changes with syntax highlighting and line-by-line comparison',
      keywords: ['code', 'diff', 'changes', 'syntax', 'programming', 'review', 'git', 'version'],
      component: 'DiffViewerComponent',
      route: '/diff-viewer',
      section: 'text-comparison',
      category: 'Development',
    },
    {
      id: 'diff-viewer-unified',
      title: 'Unified Diff View',
      description: 'View differences in unified format similar to Git diff output',
      keywords: ['unified', 'diff', 'git', 'patch', 'single', 'view', 'format', 'standard'],
      component: 'DiffViewerComponent',
      route: '/diff-viewer',
      section: 'diff-options',
      category: 'Development',
    },
    {
      id: 'diff-viewer-split',
      title: 'Split Diff View',
      description: 'Side-by-side comparison view showing original and modified versions',
      keywords: ['split', 'side by side', 'diff', 'parallel', 'comparison', 'original', 'modified'],
      component: 'DiffViewerComponent',
      route: '/diff-viewer',
      section: 'diff-options',
      category: 'Development',
    },
    {
      id: 'diff-viewer-ignore',
      title: 'Diff Ignore Options',
      description:
        'Ignore whitespace, case differences, and control context lines for focused comparison',
      keywords: ['ignore', 'whitespace', 'case', 'context', 'lines', 'options', 'filtering'],
      component: 'DiffViewerComponent',
      route: '/diff-viewer',
      section: 'diff-options',
      category: 'Development',
    },
    {
      id: 'diff-viewer-stats',
      title: 'Diff Statistics',
      description: 'View detailed statistics about additions, deletions, and changed lines',
      keywords: ['statistics', 'stats', 'additions', 'deletions', 'changes', 'metrics', 'count'],
      component: 'DiffViewerComponent',
      route: '/diff-viewer',
      section: 'diff-statistics',
      category: 'Development',
    },

    // JWT Parser features
    {
      id: 'jwt-parser',
      title: 'JWT Token Parser',
      description: 'Parse and decode JWT tokens, view header, payload, and signature',
      keywords: [
        'jwt',
        'json web token',
        'parse',
        'decode',
        'token',
        'auth',
        'authentication',
        'header',
        'payload',
        'signature',
      ],
      component: 'JwtParserComponent',
      route: '/jwt-parser',
      section: 'jwt-input',
      category: 'Development',
    },
    {
      id: 'jwt-validation',
      title: 'JWT Token Validation',
      description: 'Validate JWT tokens, check expiration, and verify structure',
      keywords: ['jwt', 'validate', 'verify', 'expiration', 'expired', 'valid', 'invalid', 'check'],
      component: 'JwtParserComponent',
      route: '/jwt-parser',
      section: 'jwt-input',
      category: 'Development',
    },
    {
      id: 'jwt-generator',
      title: 'JWT Token Generator',
      description: 'Generate JWT tokens with custom header, payload, and secret key',
      keywords: ['jwt', 'generate', 'create', 'token', 'header', 'payload', 'secret', 'sign'],
      component: 'JwtParserComponent',
      route: '/jwt-parser',
      section: 'jwt-generator',
      category: 'Development',
    },
    {
      id: 'jwt-claims',
      title: 'JWT Claims Inspector',
      description: 'Inspect standard and custom JWT claims with detailed descriptions',
      keywords: ['jwt', 'claims', 'iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti', 'custom'],
      component: 'JwtParserComponent',
      route: '/jwt-parser',
      section: 'jwt-payload',
      category: 'Development',
    },
    {
      id: 'jwt-signature',
      title: 'JWT Signature Analysis',
      description: 'Analyze JWT signature algorithms and cryptographic information',
      keywords: [
        'jwt',
        'signature',
        'algorithm',
        'hs256',
        'rs256',
        'es256',
        'crypto',
        'hmac',
        'rsa',
      ],
      component: 'JwtParserComponent',
      route: '/jwt-parser',
      section: 'jwt-signature',
      category: 'Development',
    },
    {
      id: 'jwt-timestamps',
      title: 'JWT Timestamp Decoder',
      description: 'Decode and format JWT timestamps for issued, expiry, and not-before dates',
      keywords: ['jwt', 'timestamp', 'date', 'time', 'expiry', 'issued', 'nbf', 'exp', 'iat'],
      component: 'JwtParserComponent',
      route: '/jwt-parser',
      section: 'jwt-payload',
      category: 'Development',
    },
    {
      id: 'jwt-base64-decoder',
      title: 'JWT Base64URL Decoder',
      description: 'Decode Base64URL encoded JWT parts and view raw token data',
      keywords: ['jwt', 'base64', 'base64url', 'decode', 'raw', 'parts', 'encoding'],
      component: 'JwtParserComponent',
      route: '/jwt-parser',
      section: 'jwt-input',
      category: 'Development',
    },

    // About page
    {
      id: 'about-page',
      title: 'About Debugi',
      description: 'Learn about Debugi features, available tools, keyboard shortcuts, and more',
      keywords: [
        'about',
        'info',
        'help',
        'features',
        'tools',
        'shortcuts',
        'debugi',
        'information',
      ],
      component: 'AboutComponent',
      route: '/about',
      section: 'about-info',
      category: 'Information',
    },
  ];

  private searchResults = new BehaviorSubject<SearchableItem[]>([]);
  private isSearchVisible = new BehaviorSubject<boolean>(false);
  private highlightedSection = new BehaviorSubject<string>('');

  searchResults$ = this.searchResults.asObservable();
  isSearchVisible$ = this.isSearchVisible.asObservable();
  highlightedSection$ = this.highlightedSection.asObservable();

  search(query: string): SearchableItem[] {
    if (!query.trim()) {
      this.searchResults.next([]);
      return [];
    }

    const lowercaseQuery = query.toLowerCase();
    const results = this.searchableItems.filter(item => {
      return (
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
        item.category.toLowerCase().includes(lowercaseQuery)
      );
    });

    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExactMatch =
        a.title.toLowerCase() === lowercaseQuery ||
        a.keywords.some(k => k.toLowerCase() === lowercaseQuery);
      const bExactMatch =
        b.title.toLowerCase() === lowercaseQuery ||
        b.keywords.some(k => k.toLowerCase() === lowercaseQuery);

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then sort by title length (shorter titles first for more specific matches)
      return a.title.length - b.title.length;
    });

    this.searchResults.next(results);
    return results;
  }

  showSearch() {
    this.isSearchVisible.next(true);
  }

  hideSearch() {
    this.isSearchVisible.next(false);
    this.searchResults.next([]);
  }

  highlightSection(sectionId: string) {
    this.highlightedSection.next(sectionId);

    // Auto-hide highlight after 3 seconds
    setTimeout(() => {
      this.highlightedSection.next('');
    }, 3000);
  }

  clearHighlight() {
    this.highlightedSection.next('');
  }

  getAllItems(): SearchableItem[] {
    return this.searchableItems;
  }

  getItemsByCategory(category: string): SearchableItem[] {
    return this.searchableItems.filter(item => item.category === category);
  }
}
