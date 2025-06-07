import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SearchService } from '../shared/services/search.service';
import { DataDisplayComponent } from '../shared/components/data-display/data-display.component';
import alasql from 'alasql';
import {
  QueryResult,
  preprocessSqlQuery,
  configureAlaSqlForNestedProperties,
  transformDataForNestedQueries,
} from '../shared/utils/query-utils';

@Component({
  selector: 'app-json-query',
  standalone: true,
  imports: [CommonModule, FormsModule, DataDisplayComponent],
  templateUrl: './json-query.component.html',
  styleUrl: './json-query.component.css',
})
export class JsonQueryComponent implements OnInit, OnDestroy {
  // Input data
  jsonInput = '';
  sqlQuery = '';

  // Sample data for demonstration
  sampleJsonData = [
    {
      id: 1,
      name: 'John',
      age: 28,
      gender: 'male',
      city: 'New York',
      company: {
        name: 'Tech Solutions',
        size: 120,
        department: {
          name: 'Engineering',
          employees: 45,
        },
      },
    },
    {
      id: 2,
      name: 'Lisa',
      age: 24,
      gender: 'female',
      city: 'Los Angeles',
      company: {
        name: 'Digital Creatives',
        size: 35,
        department: {
          name: 'Design',
          employees: 12,
        },
      },
    },
    {
      id: 3,
      name: 'Ahmed',
      age: 32,
      gender: 'male',
      city: 'Chicago',
      company: {
        name: 'Data Insights',
        size: 85,
        department: {
          name: 'Analytics',
          employees: 28,
        },
      },
    },
    {
      id: 4,
      name: 'Sophia',
      age: 19,
      gender: 'female',
      city: 'Miami',
      company: {
        name: 'Fresh Startups',
        size: 15,
        department: {
          name: 'Marketing',
          employees: 5,
        },
      },
    },
    {
      id: 5,
      name: 'Michael',
      age: 45,
      gender: 'male',
      city: 'Seattle',
      company: {
        name: 'Enterprise Solutions',
        size: 500,
        department: {
          name: 'Leadership',
          employees: 12,
        },
      },
    },
    {
      id: 6,
      name: 'Emma',
      age: 29,
      gender: 'female',
      city: 'Boston',
      company: {
        name: 'Health Innovations',
        size: 75,
        department: {
          name: 'Research',
          employees: 30,
        },
      },
    },
    {
      id: 7,
      name: 'David',
      age: 17,
      gender: 'male',
      city: 'Austin',
      company: {
        name: 'EdTech Futures',
        size: 25,
        department: {
          name: 'Development',
          employees: 10,
        },
      },
    },
    {
      id: 8,
      name: 'Olivia',
      age: 21,
      gender: 'female',
      city: 'Portland',
      company: {
        name: 'Green Initiatives',
        size: 40,
        department: {
          name: 'Sustainability',
          employees: 15,
        },
      },
    },
  ];

  sampleSqlQueries = [
    'SELECT * FROM ? WHERE age > 25',
    "SELECT name, age FROM ? WHERE gender = 'female'",
    "SELECT name, city FROM ? WHERE age < 30 AND gender = 'male'",
    'SELECT DISTINCT gender FROM ?',
    'SELECT DISTINCT city FROM ? ORDER BY city',
    'SELECT * FROM ? WHERE company.size > 50',
    'SELECT name, company.name as company_name FROM ? WHERE company.department.employees > 20',
    'SELECT name, company.size FROM ? ORDER BY company.size DESC',
  ];

  // Output state
  queryResult: QueryResult = { data: [] };
  isLoading = false;
  jsonFormatError: string | null = null;

  // Display options
  outputFormat: 'table' | 'json' | 'tabs' | 'csv' | 'sql' | 'html' | 'xml' | 'markdown' = 'table';
  showLineNumbers = true;

  // Highlighting
  highlightedSection = '';
  private highlightSubscription?: Subscription;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // Subscribe to search highlights
    this.highlightSubscription = this.searchService.highlightedSection$.subscribe(
      (sectionId: string) => {
        this.highlightedSection = sectionId;

        if (sectionId) {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlighted');

            // Remove highlight after 3 seconds
            setTimeout(() => {
              element.classList.remove('highlighted');
            }, 3000);
          }
        }
      }
    );

    // Initialize with sample data
    this.jsonInput = JSON.stringify(this.sampleJsonData, null, 2);
    this.sqlQuery = 'SELECT city, COUNT(*) FROM ? GROUP BY city';
  }

  ngOnDestroy(): void {
    if (this.highlightSubscription) {
      this.highlightSubscription.unsubscribe();
    }
  }

  loadSampleData(): void {
    this.jsonInput = JSON.stringify(this.sampleJsonData, null, 2);
    this.jsonFormatError = null;
  }

  loadSampleQuery(query: string): void {
    this.sqlQuery = query;
  }

  executeQuery(): void {
    this.isLoading = true;
    this.queryResult = { data: [] };

    try {
      // Parse JSON input
      const jsonData = JSON.parse(this.jsonInput);

      // Record start time for performance measurement
      const startTime = performance.now();

      // Configure AlaSQL for proper nested property handling
      configureAlaSqlForNestedProperties();

      // Transform data to support nested queries by flattening properties
      const transformedData = transformDataForNestedQueries(jsonData);

      // Preprocess the SQL query to handle quoted nested property paths
      const processedQuery = preprocessSqlQuery(this.sqlQuery);

      console.log('Original query:', this.sqlQuery);
      console.log('Processed query:', processedQuery);

      // Execute SQL query using alasql
      const result = alasql(processedQuery, [transformedData]) as Record<string, unknown>[];

      // Calculate execution time
      const executionTime = performance.now() - startTime;

      this.queryResult = {
        data: result,
        executionTime: Math.round(executionTime),
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

  prettifyJson(): void {
    try {
      // First attempt to parse as-is
      try {
        const parsedJson = JSON.parse(this.jsonInput);
        this.jsonInput = JSON.stringify(parsedJson, null, 2);
        this.jsonFormatError = null;
        return;
      } catch (initialError) {
        // If standard parsing fails, try to fix common issues
        let correctedJson = this.jsonInput;

        // Fix common JavaScript-style comments
        correctedJson = correctedJson.replace(/\/\/.*$/gm, ''); // Remove single line comments
        correctedJson = correctedJson.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments

        // Fix trailing commas in arrays and objects
        correctedJson = correctedJson.replace(/,(\s*[\]}])/g, '$1');

        // Fix missing quotes around property names (matches words followed by colon)
        correctedJson = correctedJson.replace(/(\s*)(\w+)(\s*):/g, '$1"$2"$3:');

        // Fix single quotes to double quotes for property names
        correctedJson = correctedJson.replace(/'([^']*?)'(\s*):/g, '"$1"$2:');

        // Fix single quotes around string values (but avoid replacing already valid double-quoted strings)
        const singleQuoteRegex = /:(\s*)'(.*?)'/g;
        while (singleQuoteRegex.test(correctedJson)) {
          correctedJson = correctedJson.replace(singleQuoteRegex, ':$1"$2"');
        }

        // Try to parse the fixed JSON
        try {
          const parsedCorrectedJson = JSON.parse(correctedJson);
          this.jsonInput = JSON.stringify(parsedCorrectedJson, null, 2);
          this.jsonFormatError = null;
        } catch {
          // If still not valid, throw the original error
          throw initialError;
        }
      }
    } catch (error) {
      console.error('Invalid JSON format', error);
      this.jsonFormatError =
        error instanceof Error
          ? `${error.message}. Try enclosing property names in double quotes and string values in double quotes.`
          : 'Invalid JSON format';
    }
  }

  clearData(): void {
    this.jsonInput = '';
    this.queryResult = { data: [] };
    this.jsonFormatError = null;
  }
}
