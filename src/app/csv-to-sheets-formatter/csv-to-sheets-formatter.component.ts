import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { Subscription } from 'rxjs';
import alasql from 'alasql';
import {
  QueryResult,
  preprocessSqlQuery,
  formatTableCell,
  getQueryResultKeys,
} from '../shared/utils/query-utils';
import { DataDisplayComponent } from '../shared/components/data-display/data-display.component';

@Component({
  selector: 'app-csv-to-sheets-formatter',
  standalone: true,
  imports: [FormsModule, CommonModule, DataDisplayComponent],
  templateUrl: './csv-to-sheets-formatter.component.html',
  styleUrls: ['./csv-to-sheets-formatter.component.css'],
})
export class CsvToSheetsFormatterComponent implements OnInit, OnDestroy {
  csvInput: string = '';

  // Search integration
  private highlightSubscription?: Subscription;

  // Configuration options
  delimiter: string = ',';
  hasHeaders: boolean = true;
  outputFormat: 'table' | 'json' | 'tabs' | 'csv' | 'sql' | 'html' | 'xml' | 'markdown' = 'table';

  // Processed CSV data as array of objects
  csvData: Record<string, unknown>[] = [];

  // Query functionality - for separate query feature (optional)
  sqlQuery: string = 'SELECT * FROM ?';
  queryResult: QueryResult = { data: [] };
  isLoading = false;
  showLineNumbers = true;

  // Current display data (either CSV data or query results)
  get displayData(): Record<string, unknown>[] {
    return this.queryResult.data.length > 0 ? this.queryResult.data : this.csvData;
  }

  // Check if currently showing query results
  get isShowingQueryResults(): boolean {
    return this.queryResult.data.length > 0;
  }

  // Get the appropriate table name for current display
  get displayTableName(): string {
    return this.isShowingQueryResults ? 'query_results' : 'csv_data';
  }

  // Sample SQL queries for CSV data
  sampleSqlQueries: string[] = [
    'SELECT * FROM ?',
    'SELECT Name, Age FROM ?',
    'SELECT * FROM ? WHERE Age > 25',
    'SELECT DISTINCT City FROM ?',
    'SELECT * FROM ? ORDER BY Age DESC',
    'SELECT COUNT(*) as total FROM ?',
    'SELECT City, COUNT(*) as total FROM ? GROUP BY City',
    'SELECT * FROM ? WHERE City = "New York"',
  ];

  // Sample data
  sampleData: string = `Name,Age,City,Email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com
Alice Brown,28,Houston,alice@example.com`;

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.highlightSubscription = this.searchService.highlightedSection$.subscribe(
      (section: string | null) => {
        if (section) {
          setTimeout(() => {
            const element = document.getElementById(section);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('highlighted');
              setTimeout(() => element.classList.remove('highlighted'), 3000);
            }
          }, 100);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.highlightSubscription) {
      this.highlightSubscription.unsubscribe();
    }
  }

  formatForSheets() {
    if (!this.csvInput.trim()) {
      this.csvData = [];
      return;
    }

    const lines = this.parseCSV(this.csvInput);
    this.csvData = this.convertLinesToObjects(lines);
  }

  private convertLinesToObjects(lines: string[][]): Record<string, unknown>[] {
    if (lines.length === 0) {
      return [];
    }

    const headers = this.hasHeaders ? lines[0] : lines[0].map((_, i) => `Column${i + 1}`);
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;

    return dataRows.map(row => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }

  parseCSV(csvText: string): string[][] {
    const lines = csvText.trim().split('\n');
    const result: string[][] = [];

    for (const line of lines) {
      const row = this.parseCsvLine(line);
      result.push(row);
    }

    return result;
  }

  parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === this.delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  loadSampleData() {
    this.csvInput = this.sampleData;
    this.formatForSheets();
  }

  clearData() {
    this.csvInput = '';
    this.csvData = [];
    this.sqlQuery = '';
    this.queryResult = { data: [] };
  }

  // Clear query results to show original CSV data
  clearQueryResults() {
    this.queryResult = { data: [] };
    this.sqlQuery = '';
  }

  // Query functionality (separate feature for SQL querying)
  loadSampleQuery(query: string): void {
    this.sqlQuery = query;
  }

  executeQuery(): void {
    if (!this.csvInput.trim() || !this.sqlQuery.trim()) {
      return;
    }

    this.isLoading = true;
    const startTime = performance.now();

    try {
      // Use the parsed csvData for querying
      if (this.csvData.length === 0) {
        this.queryResult = { data: [], error: 'No data to query' };
        return;
      }

      // Execute the SQL query
      const processedQuery = preprocessSqlQuery(this.sqlQuery);
      const result = alasql(processedQuery, [this.csvData]);

      this.queryResult = {
        data: Array.isArray(result) ? result : [result],
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      console.error('Query execution error:', error);
      this.queryResult = {
        data: [],
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      this.isLoading = false;
    }
  }

  // Delegate methods to shared utility functions for backward compatibility
  formatTableCell(value: unknown): string {
    return formatTableCell(value);
  }

  getQueryResultKeys(): string[] {
    return getQueryResultKeys(this.queryResult.data);
  }
}
