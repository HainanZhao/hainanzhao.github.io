import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { Subscription } from 'rxjs';

interface CsvStats {
  rows: number;
  columns: number;
  headers: string[];
  dataTypes: string[];
  hasHeaders: boolean;
}

@Component({
  selector: 'app-csv-to-sheets-formatter',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './csv-to-sheets-formatter.component.html',
  styleUrls: ['./csv-to-sheets-formatter.component.css']
})
export class CsvToSheetsFormatterComponent implements OnInit, OnDestroy {
  csvInput: string = '';
  csvOutput: string = '';
  
  // Search integration
  private highlightSubscription?: Subscription;
  
  // Configuration options
  delimiter: string = ',';
  hasHeaders: boolean = true;
  outputFormat: string = 'tabs'; // tabs, json, sql, html, xml
  
  // Statistics
  csvStats: CsvStats | null = null;
  
  // Data manipulation
  selectedColumns: number[] = [];
  sortColumn: number = -1;
  sortDirection: 'asc' | 'desc' = 'asc';
  filterColumn: number = -1;
  filterValue: string = '';
  
  // Sample data
  sampleData: string = `Name,Age,City,Email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com
Alice Brown,28,Houston,alice@example.com`;

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.highlightSubscription = this.searchService.highlightedSection$.subscribe((section: string | null) => {
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
    });
  }

  ngOnDestroy() {
    if (this.highlightSubscription) {
      this.highlightSubscription.unsubscribe();
    }
  }

  formatForSheets() {
    if (!this.csvInput.trim()) {
      this.csvOutput = '';
      return;
    }

    const lines = this.parseCSV(this.csvInput);
    
    switch (this.outputFormat) {
      case 'tabs':
        this.csvOutput = lines.map(row => row.join('\t')).join('\n');
        break;
      case 'json':
        this.convertToJSON(lines);
        break;
      case 'sql':
        this.convertToSQL(lines);
        break;
      case 'html':
        this.convertToHTML(lines);
        break;
      case 'xml':
        this.convertToXML(lines);
        break;
      case 'markdown':
        this.convertToMarkdown(lines);
        break;
      default:
        this.csvOutput = lines.map(row => row.join('\t')).join('\n');
    }
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

  convertToJSON(lines: string[][]) {
    if (lines.length === 0) {
      this.csvOutput = '[]';
      return;
    }

    const headers = this.hasHeaders ? lines[0] : lines[0].map((_, i) => `Column${i + 1}`);
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    const jsonData = dataRows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    this.csvOutput = JSON.stringify(jsonData, null, 2);
  }

  convertToSQL(lines: string[][]) {
    if (lines.length === 0) {
      this.csvOutput = '';
      return;
    }

    const tableName = 'csv_data';
    const headers = this.hasHeaders ? lines[0] : lines[0].map((_, i) => `Column${i + 1}`);
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    // Create table statement
    const createTable = `CREATE TABLE ${tableName} (\n  ${headers.map(header => `${header.replace(/\s+/g, '_')} VARCHAR(255)`).join(',\n  ')}\n);\n\n`;
    
    // Insert statements
    const inserts = dataRows.map(row => {
      const values = row.map(value => `'${value.replace(/'/g, "''")}'`).join(', ');
      return `INSERT INTO ${tableName} (${headers.map(h => h.replace(/\s+/g, '_')).join(', ')}) VALUES (${values});`;
    }).join('\n');
    
    this.csvOutput = createTable + inserts;
  }

  convertToHTML(lines: string[][]) {
    if (lines.length === 0) {
      this.csvOutput = '<table></table>';
      return;
    }

    let html = '<table border="1" cellpadding="5" cellspacing="0">\n';
    
    if (this.hasHeaders && lines.length > 0) {
      html += '  <thead>\n    <tr>\n';
      lines[0].forEach(header => {
        html += `      <th>${this.escapeHtml(header)}</th>\n`;
      });
      html += '    </tr>\n  </thead>\n';
    }
    
    html += '  <tbody>\n';
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    dataRows.forEach(row => {
      html += '    <tr>\n';
      row.forEach(cell => {
        html += `      <td>${this.escapeHtml(cell)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';
    
    this.csvOutput = html;
  }

  convertToXML(lines: string[][]) {
    if (lines.length === 0) {
      this.csvOutput = '<data></data>';
      return;
    }

    const headers = this.hasHeaders ? lines[0] : lines[0].map((_, i) => `Column${i + 1}`);
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
    
    dataRows.forEach(row => {
      xml += '  <row>\n';
      headers.forEach((header, index) => {
        const tagName = header.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        xml += `    <${tagName}>${this.escapeXml(row[index] || '')}</${tagName}>\n`;
      });
      xml += '  </row>\n';
    });
    
    xml += '</data>';
    this.csvOutput = xml;
  }

  convertToMarkdown(lines: string[][]) {
    if (lines.length === 0) {
      this.csvOutput = '';
      return;
    }

    const headers = this.hasHeaders ? lines[0] : lines[0].map((_, i) => `Column${i + 1}`);
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    // Header row
    let markdown = '| ' + headers.join(' | ') + ' |\n';
    
    // Separator row
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    // Data rows
    dataRows.forEach(row => {
      markdown += '| ' + row.join(' | ') + ' |\n';
    });
    
    this.csvOutput = markdown;
  }

  analyzeCSV() {
    if (!this.csvInput.trim()) {
      this.csvStats = null;
      return;
    }

    const lines = this.parseCSV(this.csvInput);
    
    if (lines.length === 0) {
      this.csvStats = null;
      return;
    }

    const headers = this.hasHeaders ? lines[0] : lines[0].map((_, i) => `Column${i + 1}`);
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    // Analyze data types
    const dataTypes: string[] = [];
    if (dataRows.length > 0) {
      headers.forEach((_, colIndex) => {
        const sampleValues = dataRows.slice(0, 10).map(row => row[colIndex] || '').filter(val => val.trim() !== '');
        dataTypes.push(this.guessDataType(sampleValues));
      });
    }

    this.csvStats = {
      rows: dataRows.length,
      columns: headers.length,
      headers,
      dataTypes,
      hasHeaders: this.hasHeaders
    };
  }

  guessDataType(values: string[]): string {
    if (values.length === 0) return 'Unknown';
    
    const numberPattern = /^-?\d+\.?\d*$/;
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlPattern = /^https?:\/\//;
    
    const isNumber = values.every(val => numberPattern.test(val));
    const isDate = values.every(val => datePattern.test(val));
    const isEmail = values.every(val => emailPattern.test(val));
    const isUrl = values.every(val => urlPattern.test(val));
    
    if (isNumber) return 'Number';
    if (isDate) return 'Date';
    if (isEmail) return 'Email';
    if (isUrl) return 'URL';
    
    return 'Text';
  }

  sortData() {
    if (!this.csvInput.trim() || this.sortColumn === -1) return;
    
    const lines = this.parseCSV(this.csvInput);
    if (lines.length === 0) return;
    
    const headers = this.hasHeaders ? lines[0] : [];
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    dataRows.sort((a, b) => {
      const aVal = a[this.sortColumn] || '';
      const bVal = b[this.sortColumn] || '';
      
      // Try to compare as numbers first
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return this.sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Compare as strings
      return this.sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    });
    
    const sortedLines = this.hasHeaders ? [headers, ...dataRows] : dataRows;
    this.csvInput = sortedLines.map(row => row.join(this.delimiter)).join('\n');
    this.formatForSheets();
  }

  filterData() {
    if (!this.csvInput.trim() || this.filterColumn === -1 || !this.filterValue.trim()) {
      this.formatForSheets();
      return;
    }
    
    const lines = this.parseCSV(this.csvInput);
    if (lines.length === 0) return;
    
    const headers = this.hasHeaders ? lines[0] : [];
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    const filteredRows = dataRows.filter(row => {
      const cellValue = row[this.filterColumn] || '';
      return cellValue.toLowerCase().includes(this.filterValue.toLowerCase());
    });
    
    const filteredLines = this.hasHeaders ? [headers, ...filteredRows] : filteredRows;
    const filteredCsv = filteredLines.map(row => row.join(this.delimiter)).join('\n');
    
    // Temporarily update input for formatting
    const originalInput = this.csvInput;
    this.csvInput = filteredCsv;
    this.formatForSheets();
    this.csvInput = originalInput; // Restore original
  }

  removeDuplicates() {
    if (!this.csvInput.trim()) return;
    
    const lines = this.parseCSV(this.csvInput);
    if (lines.length === 0) return;
    
    const headers = this.hasHeaders ? lines[0] : [];
    const dataRows = this.hasHeaders ? lines.slice(1) : lines;
    
    // Remove duplicate rows
    const uniqueRows = dataRows.filter((row, index, self) => 
      index === self.findIndex(r => r.join('|') === row.join('|'))
    );
    
    const uniqueLines = this.hasHeaders ? [headers, ...uniqueRows] : uniqueRows;
    this.csvInput = uniqueLines.map(row => row.join(this.delimiter)).join('\n');
    this.formatForSheets();
  }

  transoposeData() {
    if (!this.csvInput.trim()) return;
    
    const lines = this.parseCSV(this.csvInput);
    if (lines.length === 0) return;
    
    const maxCols = Math.max(...lines.map(row => row.length));
    const transposed: string[][] = [];
    
    for (let col = 0; col < maxCols; col++) {
      const newRow: string[] = [];
      for (let row = 0; row < lines.length; row++) {
        newRow.push(lines[row][col] || '');
      }
      transposed.push(newRow);
    }
    
    this.csvInput = transposed.map(row => row.join(this.delimiter)).join('\n');
    this.formatForSheets();
  }

  loadSampleData() {
    this.csvInput = this.sampleData;
    this.formatForSheets();
    this.analyzeCSV();
  }

  clearData() {
    this.csvInput = '';
    this.csvOutput = '';
    this.csvStats = null;
    this.selectedColumns = [];
    this.sortColumn = -1;
    this.filterColumn = -1;
    this.filterValue = '';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }

  downloadAsFile(content: string, filename: string, contentType: string = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
