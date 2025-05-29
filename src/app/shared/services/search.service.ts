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
  providedIn: 'root'
})
export class SearchService {
  private searchableItems: SearchableItem[] = [
    // Calculator features
    {
      id: 'calc-basic',
      title: 'Basic Calculator',
      description: 'Perform basic arithmetic operations like addition, subtraction, multiplication, and division',
      keywords: ['calculator', 'math', 'arithmetic', 'add', 'subtract', 'multiply', 'divide', 'plus', 'minus'],
      component: 'CalculatorComponent',
      route: '/calculator',
      section: 'basic-operations',
      category: 'Calculator'
    },

    // String Utils features
    {
      id: 'string-case',
      title: 'Case Converter',
      description: 'Convert text between different cases: uppercase, lowercase, camelCase, PascalCase, kebab-case, snake_case',
      keywords: ['case', 'convert', 'uppercase', 'lowercase', 'camel', 'pascal', 'kebab', 'snake', 'text', 'string'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'case-conversion',
      category: 'String Utils'
    },
    {
      id: 'text-analysis',
      title: 'Text Analysis',
      description: 'Analyze text properties: character count, word count, reading time, common words',
      keywords: ['text', 'analysis', 'count', 'characters', 'words', 'sentences', 'reading', 'time', 'frequency'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'text-analysis',
      category: 'String Utils'
    },
    {
      id: 'text-manipulation',
      title: 'Text Manipulation',
      description: 'Find and replace, reverse text, remove spaces, sort lines, remove duplicates, extract data',
      keywords: ['find', 'replace', 'reverse', 'sort', 'duplicate', 'extract', 'email', 'url', 'number', 'manipulation'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'text-manipulation',
      category: 'String Utils'
    },
    {
      id: 'encoding-decoding',
      title: 'Encoding & Decoding',
      description: 'Encode and decode text using Base64, URL encoding, HTML entities',
      keywords: ['encode', 'decode', 'base64', 'url', 'html', 'entities', 'encoding'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'encoding-decoding',
      category: 'String Utils'
    },
    {
      id: 'hash-generation',
      title: 'Hash Generation',
      description: 'Generate cryptographic hashes like SHA-256 and MD5',
      keywords: ['hash', 'sha', 'md5', 'crypto', 'checksum', 'digest'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'hash-generation',
      category: 'String Utils'
    },
    {
      id: 'qr-code-generator',
      title: 'QR Code Generator',
      description: 'Generate QR codes from text with customizable size and error correction levels',
      keywords: ['qr', 'qr code', 'generate', 'barcode', 'scan', 'mobile', 'link', 'url', 'text'],
      component: 'QrCodeComponent',
      route: '/qr-code',
      section: 'qr-code-generator',
      category: 'QR Code'
    },
    {
      id: 'password-generator',
      title: 'Password Generator',
      description: 'Generate secure passwords with customizable length and character types',
      keywords: ['password', 'generate', 'random', 'secure', 'uppercase', 'lowercase', 'numbers', 'symbols'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'password-generator',
      category: 'String Utils'
    },
    {
      id: 'random-characters',
      title: 'Random Character Generator',
      description: 'Generate random characters, letters, numbers, or special characters',
      keywords: ['random', 'character', 'letter', 'number', 'special', 'generate'],
      component: 'StringUtilsComponent',
      route: '/string-utils',
      section: 'random-generator',
      category: 'String Utils'
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
      category: 'CSV Utils'
    },
    {
      id: 'csv-analysis',
      title: 'CSV Analysis',
      description: 'Analyze CSV data: row/column counts, data types, headers detection',
      keywords: ['csv', 'analysis', 'statistics', 'rows', 'columns', 'data', 'types', 'headers'],
      component: 'CsvToSheetsFormatterComponent',
      route: '/csv-formatter',
      section: 'csv-analysis',
      category: 'CSV Utils'
    },
    {
      id: 'csv-manipulation',
      title: 'CSV Data Manipulation',
      description: 'Sort, filter, remove duplicates, transpose CSV data',
      keywords: ['csv', 'sort', 'filter', 'duplicate', 'transpose', 'manipulation', 'data'],
      component: 'CsvToSheetsFormatterComponent',
      route: '/csv-formatter',
      section: 'csv-manipulation',
      category: 'CSV Utils'
    },

    // Date Utils features
    {
      id: 'date-conversion',
      title: 'Date Format Conversion',
      description: 'Convert dates between different formats and timezones',
      keywords: ['date', 'time', 'format', 'convert', 'timezone', 'timestamp'],
      component: 'DateUtilsComponent',
      route: '/date-utils',
      section: 'date-conversion',
      category: 'Date Utils'
    },

    // Number Utils features
    {
      id: 'number-conversion',
      title: 'Number Base Conversion',
      description: 'Convert numbers between different bases: binary, decimal, hexadecimal, octal',
      keywords: ['number', 'base', 'binary', 'decimal', 'hex', 'hexadecimal', 'octal', 'convert'],
      component: 'NumberUtilsComponent',
      route: '/number-utils',
      section: 'number-conversion',
      category: 'Number Utils'
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
      category: 'Array Utils'
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
      category: 'JSON Visualizer'
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
      category: 'Regex Tester'
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
      category: 'Performance Testing'
    },
    {
      id: 'iframe-performance-tests',
      title: 'Performance Tests',
      description: 'Test iframe isolation with CPU-intensive, DOM manipulation, animation, memory, and network tests',
      keywords: ['iframe', 'cpu', 'dom', 'animation', 'memory', 'network', 'isolation', 'thread blocking'],
      component: 'IframePerformanceComponent',
      route: '/iframe-performance',
      section: 'tests',
      category: 'Performance Testing'
    },
    {
      id: 'iframe-performance-results',
      title: 'Performance Analysis',
      description: 'Analyze test results to understand iframe performance impact and thread isolation',
      keywords: ['iframe', 'analysis', 'results', 'frame drops', 'thread', 'isolation', 'performance impact'],
      component: 'IframePerformanceComponent',
      route: '/iframe-performance',
      section: 'results',
      category: 'Performance Testing'
    }
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
      return item.title.toLowerCase().includes(lowercaseQuery) ||
             item.description.toLowerCase().includes(lowercaseQuery) ||
             item.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
             item.category.toLowerCase().includes(lowercaseQuery);
    });

    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase() === lowercaseQuery || 
                         a.keywords.some(k => k.toLowerCase() === lowercaseQuery);
      const bExactMatch = b.title.toLowerCase() === lowercaseQuery || 
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
