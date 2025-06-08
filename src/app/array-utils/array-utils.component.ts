import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { UrlStateService } from '../shared/services/url-state.service';
import { Subject, takeUntil } from 'rxjs';
import * as arrayUtils from '../shared/utils/array-utils';

interface ArrayStats {
  length: number;
  uniqueCount: number;
  dataType: 'numeric' | 'string' | 'mixed' | 'boolean' | 'object';
  min: number | null;
  max: number | null;
  average: number | null;
}

@Component({
  selector: 'app-array-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './array-utils.component.html',
  styleUrls: ['./array-utils.component.css'],
})
export class ArrayUtilsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  highlightedSection = '';

  // Input and parsing
  arrayInput: string = '[1, 2, 3, 4, 5, 2, 3]';
  inputFormat: string = 'auto';
  parsedArray: any[] = [];

  // Array statistics
  arrayStats: ArrayStats = {
    length: 0,
    uniqueCount: 0,
    dataType: 'mixed',
    min: null,
    max: null,
    average: null,
  };

  // Operation results
  operationResult: string = '';
  transformResult: string = '';
  groupingResult: string = '';
  generatedArray: string = '';

  // Filter controls
  filterValue: string = '';
  filterOperation: string = 'equals';
  sliceStart: number = 0;
  sliceEnd: number = 5;

  // Transform controls
  chunkSize: number = 2;
  groupByKey: string = '';

  // Generation controls
  rangeStart: number = 1;
  rangeEnd: number = 10;
  rangeStep: number = 1;
  randomCount: number = 10;
  randomMin: number = 1;
  randomMax: number = 100;

  // Export controls
  outputFormat: string = 'json';

  // URL sharing
  private readonly ARRAY_PARAM_KEY = 'array';

  constructor(
    private searchService: SearchService,
    private urlStateService: UrlStateService
  ) {}

  ngOnInit() {
    this.searchService.highlightedSection$.pipe(takeUntil(this.destroy$)).subscribe(sectionId => {
      this.highlightedSection = sectionId;
    });

    // Load array from URL if present
    const savedArray = this.urlStateService.getStateFromUrl(this.ARRAY_PARAM_KEY);
    if (savedArray) {
      this.arrayInput = savedArray;
    }

    // Initialize with default array
    this.parseArrayInput();
    this.analyzeArray();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Array Input and Parsing
  parseArrayInput() {
    try {
      let parsed: any[] = [];

      if (!this.arrayInput.trim()) {
        this.parsedArray = [];
        return;
      }

      switch (this.inputFormat) {
        case 'json':
          parsed = JSON.parse(this.arrayInput);
          break;
        case 'csv':
          parsed = this.arrayInput.split(',').map(item => item.trim());
          break;
        case 'lines':
          parsed = this.arrayInput
            .split('\n')
            .map(item => item.trim())
            .filter(item => item);
          break;
        case 'space':
          parsed = this.arrayInput.split(/\s+/).filter(item => item);
          break;
        case 'auto':
        default:
          // Try JSON first
          try {
            parsed = JSON.parse(this.arrayInput);
          } catch {
            // Fall back to CSV
            if (this.arrayInput.includes(',')) {
              parsed = this.arrayInput.split(',').map(item => item.trim());
            } else if (this.arrayInput.includes('\n')) {
              parsed = this.arrayInput
                .split('\n')
                .map(item => item.trim())
                .filter(item => item);
            } else {
              parsed = this.arrayInput.split(/\s+/).filter(item => item);
            }
          }
          break;
      }

      // Try to convert strings to numbers where possible
      this.parsedArray = parsed.map(item => {
        if (typeof item === 'string' && !isNaN(Number(item)) && item.trim() !== '') {
          return Number(item);
        }
        return item;
      });
    } catch (error) {
      console.error('Error parsing array:', error);
      this.parsedArray = [];
    }
  }

  analyzeArray() {
    if (!this.parsedArray.length) {
      this.arrayStats = {
        length: 0,
        uniqueCount: 0,
        dataType: 'mixed',
        min: null,
        max: null,
        average: null,
      };
      return;
    }

    const unique = arrayUtils.unique(this.parsedArray);
    const numbers = this.parsedArray.filter(item => typeof item === 'number' && !isNaN(item));
    const strings = this.parsedArray.filter(item => typeof item === 'string');
    const booleans = this.parsedArray.filter(item => typeof item === 'boolean');
    const objects = this.parsedArray.filter(item => typeof item === 'object' && item !== null);

    let dataType: ArrayStats['dataType'] = 'mixed';
    if (numbers.length === this.parsedArray.length) dataType = 'numeric';
    else if (strings.length === this.parsedArray.length) dataType = 'string';
    else if (booleans.length === this.parsedArray.length) dataType = 'boolean';
    else if (objects.length === this.parsedArray.length) dataType = 'object';

    this.arrayStats = {
      length: this.parsedArray.length,
      uniqueCount: unique.length,
      dataType,
      min: numbers.length > 0 ? Math.min(...numbers) : null,
      max: numbers.length > 0 ? Math.max(...numbers) : null,
      average: numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null,
    };
  }

  // URL sharing
  shareArray(event?: Event): void {
    if (!this.parsedArray.length) return;
    const buttonElement = event?.target as HTMLElement;
    this.urlStateService.shareUrlWithFeedback(this.ARRAY_PARAM_KEY, this.arrayInput, buttonElement);
  }

  // Basic Array Operations
  shuffleArray() {
    if (!this.parsedArray.length) return;
    const result = arrayUtils.shuffle(this.parsedArray);
    this.operationResult = this.formatArrayOutput(result);
  }

  uniqueArray() {
    if (!this.parsedArray.length) return;
    const result = arrayUtils.unique(this.parsedArray);
    this.operationResult = this.formatArrayOutput(result);
  }

  reverseArray() {
    if (!this.parsedArray.length) return;
    const result = [...this.parsedArray].reverse();
    this.operationResult = this.formatArrayOutput(result);
  }

  sortArray() {
    if (!this.parsedArray.length) return;
    const result = [...this.parsedArray].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
    this.operationResult = this.formatArrayOutput(result);
  }

  flattenArray() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.flat(Infinity);
    this.operationResult = this.formatArrayOutput(result);
  }

  // Filtering and Slicing
  filterArray() {
    if (!this.parsedArray.length || !this.filterValue) return;

    const result = this.parsedArray.filter(item => {
      const itemStr = String(item).toLowerCase();
      const filterStr = this.filterValue.toLowerCase();

      switch (this.filterOperation) {
        case 'equals':
          return itemStr === filterStr;
        case 'contains':
          return itemStr.includes(filterStr);
        case 'startsWith':
          return itemStr.startsWith(filterStr);
        case 'endsWith':
          return itemStr.endsWith(filterStr);
        case 'greater':
          return typeof item === 'number' && item > Number(this.filterValue);
        case 'less':
          return typeof item === 'number' && item < Number(this.filterValue);
        default:
          return false;
      }
    });

    this.operationResult = this.formatArrayOutput(result);
  }

  sliceArray() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.slice(this.sliceStart, this.sliceEnd);
    this.operationResult = this.formatArrayOutput(result);
  }

  // Mathematical Operations
  calculateSum() {
    const numbers = this.parsedArray.filter(item => typeof item === 'number');
    if (!numbers.length) return;
    const sum = numbers.reduce((a, b) => a + b, 0);
    this.operationResult = `Sum: ${sum}`;
  }

  calculateMedian() {
    const numbers = this.parsedArray.filter(item => typeof item === 'number').sort((a, b) => a - b);
    if (!numbers.length) return;

    const mid = Math.floor(numbers.length / 2);
    const median = numbers.length % 2 === 0 ? (numbers[mid - 1] + numbers[mid]) / 2 : numbers[mid];
    this.operationResult = `Median: ${median}`;
  }

  calculateMode() {
    if (!this.parsedArray.length) return;

    const frequency: Record<string, number> = {};
    this.parsedArray.forEach(item => {
      const key = String(item);
      frequency[key] = (frequency[key] || 0) + 1;
    });

    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);

    this.operationResult = `Mode: ${modes.join(', ')} (appears ${maxFreq} times)`;
  }

  calculateStdDev() {
    const numbers = this.parsedArray.filter(item => typeof item === 'number');
    if (numbers.length < 2) return;

    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance =
      numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);

    this.operationResult = `Standard Deviation: ${stdDev.toFixed(4)}`;
  }

  // Transformations
  convertToNumbers() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map(item => {
      const num = Number(item);
      return isNaN(num) ? 0 : num;
    });
    this.transformResult = this.formatArrayOutput(result);
  }

  convertToStrings() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map(item => String(item));
    this.transformResult = this.formatArrayOutput(result);
  }

  convertToBooleans() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map(item => Boolean(item));
    this.transformResult = this.formatArrayOutput(result);
  }

  toUpperCase() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map(item =>
      typeof item === 'string' ? item.toUpperCase() : item
    );
    this.transformResult = this.formatArrayOutput(result);
  }

  toLowerCase() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map(item =>
      typeof item === 'string' ? item.toLowerCase() : item
    );
    this.transformResult = this.formatArrayOutput(result);
  }

  trimStrings() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map(item => (typeof item === 'string' ? item.trim() : item));
    this.transformResult = this.formatArrayOutput(result);
  }

  capitalizeStrings() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map(item =>
      typeof item === 'string' ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item
    );
    this.transformResult = this.formatArrayOutput(result);
  }

  chunkArray() {
    if (!this.parsedArray.length || this.chunkSize < 1) return;

    const result = [];
    for (let i = 0; i < this.parsedArray.length; i += this.chunkSize) {
      result.push(this.parsedArray.slice(i, i + this.chunkSize));
    }

    this.transformResult = JSON.stringify(result, null, 2);
  }

  transposeMatrix() {
    if (!this.parsedArray.length) return;

    // Check if it's a 2D array
    if (!Array.isArray(this.parsedArray[0])) {
      this.transformResult = 'Error: Array must be 2D for transposition';
      return;
    }

    const rows = this.parsedArray.length;
    const cols = this.parsedArray[0].length;
    const result = Array(cols)
      .fill(null)
      .map(() => Array(rows));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = this.parsedArray[i][j];
      }
    }

    this.transformResult = JSON.stringify(result, null, 2);
  }

  zipArrays() {
    if (!this.parsedArray.length) return;
    const result = this.parsedArray.map((item, index) => [index, item]);
    this.transformResult = JSON.stringify(result, null, 2);
  }

  // Grouping and Analysis
  groupByProperty() {
    if (!this.parsedArray.length || !this.groupByKey) return;

    try {
      const result = arrayUtils.groupBy(this.parsedArray, this.groupByKey as any);
      this.groupingResult = JSON.stringify(result, null, 2);
    } catch (error) {
      this.groupingResult = `Error: ${error}`;
    }
  }

  getFrequency() {
    if (!this.parsedArray.length) return;

    const frequency: Record<string, number> = {};
    this.parsedArray.forEach(item => {
      const key = JSON.stringify(item);
      frequency[key] = (frequency[key] || 0) + 1;
    });

    const sortedFreq = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .map(([key, count]) => ({ value: JSON.parse(key), count }));

    this.groupingResult = JSON.stringify(sortedFreq, null, 2);
  }

  findOutliers() {
    const numbers = this.parsedArray.filter(item => typeof item === 'number');
    if (numbers.length < 4) {
      this.groupingResult = 'Error: Need at least 4 numbers to find outliers';
      return;
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = numbers.filter(num => num < lowerBound || num > upperBound);

    this.groupingResult = JSON.stringify(
      {
        outliers,
        bounds: { lower: lowerBound, upper: upperBound },
        quartiles: { q1, q3, iqr },
      },
      null,
      2
    );
  }

  getPercentiles() {
    const numbers = this.parsedArray.filter(item => typeof item === 'number').sort((a, b) => a - b);
    if (!numbers.length) return;

    const getPercentile = (p: number) => {
      const index = (p / 100) * (numbers.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;

      return numbers[lower] * (1 - weight) + numbers[upper] * weight;
    };

    const percentiles = {
      p10: getPercentile(10),
      p25: getPercentile(25),
      p50: getPercentile(50),
      p75: getPercentile(75),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
    };

    this.groupingResult = JSON.stringify(percentiles, null, 2);
  }

  // Array Generation
  createRange() {
    if (this.rangeStep === 0) return;

    const result = arrayUtils.range(this.rangeStart, this.rangeEnd);
    if (this.rangeStep !== 1) {
      const stepped = result.filter((_, index) => index % this.rangeStep === 0);
      this.generatedArray = this.formatArrayOutput(stepped);
    } else {
      this.generatedArray = this.formatArrayOutput(result);
    }
  }

  generateRandomNumbers() {
    const result = Array.from(
      { length: this.randomCount },
      () => Math.floor(Math.random() * (this.randomMax - this.randomMin + 1)) + this.randomMin
    );
    this.generatedArray = this.formatArrayOutput(result);
  }

  generateRandomStrings() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const result = Array.from({ length: this.randomCount }, () => {
      let str = '';
      for (let i = 0; i < 8; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    });
    this.generatedArray = this.formatArrayOutput(result);
  }

  generateGUID() {
    const result = Array.from({ length: this.randomCount }, () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
    );
    this.generatedArray = this.formatArrayOutput(result);
  }

  fibonacci() {
    const result = [0, 1];
    for (let i = 2; i < this.randomCount; i++) {
      result[i] = result[i - 1] + result[i - 2];
    }
    this.generatedArray = this.formatArrayOutput(result.slice(0, this.randomCount));
  }

  primeNumbers() {
    const isPrime = (n: number) => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    const result = [];
    let num = 2;
    while (result.length < this.randomCount) {
      if (isPrime(num)) result.push(num);
      num++;
    }

    this.generatedArray = this.formatArrayOutput(result);
  }

  factorials() {
    const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
    const result = Array.from({ length: this.randomCount }, (_, i) => factorial(i));
    this.generatedArray = this.formatArrayOutput(result);
  }

  // Utility methods
  formatArrayOutput(array: any[]): string {
    if (this.outputFormat === 'json') {
      return JSON.stringify(array, null, 2);
    } else if (this.outputFormat === 'csv') {
      return array.join(', ');
    } else if (this.outputFormat === 'tsv') {
      return array.join('\t');
    } else if (this.outputFormat === 'lines') {
      return array.join('\n');
    } else if (this.outputFormat === 'table') {
      return array.map((item, index) => `${index}: ${JSON.stringify(item)}`).join('\n');
    }
    return JSON.stringify(array);
  }

  exportArray() {
    const currentResult =
      this.operationResult || this.transformResult || this.groupingResult || this.generatedArray;
    if (currentResult) {
      this.copyToClipboard(currentResult);
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }

  clearAllFields() {
    this.arrayInput = '[1, 2, 3, 4, 5, 2, 3]';
    this.operationResult = '';
    this.transformResult = '';
    this.groupingResult = '';
    this.generatedArray = '';
    this.filterValue = '';
    this.groupByKey = '';
    this.parseArrayInput();
    this.analyzeArray();
  }
}
