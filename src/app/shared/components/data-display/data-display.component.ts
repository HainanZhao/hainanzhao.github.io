import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatTableCell, getQueryResultKeys } from '../../utils/query-utils';

export interface DataDisplayOptions {
  showLineNumbers?: boolean;
  maxRows?: number;
  allowDownload?: boolean;
  allowCopy?: boolean;
}

@Component({
  selector: 'app-data-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.css'],
})
export class DataDisplayComponent implements OnChanges {
  @Input() data: Record<string, unknown>[] = [];
  @Input() format: 'table' | 'json' | 'tabs' | 'csv' | 'sql' | 'html' | 'xml' | 'markdown' =
    'table';
  @Input() options: DataDisplayOptions = {
    showLineNumbers: true,
    allowDownload: true,
    allowCopy: true,
  };
  @Input() tableName: string = 'data';
  @Input() hasHeaders: boolean = true;

  // Converted output for non-table formats
  convertedOutput: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['format'] || changes['tableName'] || changes['hasHeaders']) {
      this.updateOutput();
    }
  }

  updateOutput() {
    if (!this.data || this.data.length === 0) {
      this.convertedOutput = '';
      return;
    }

    switch (this.format) {
      case 'table':
        // Table format doesn't need conversion
        this.convertedOutput = '';
        break;
      case 'json':
        this.convertedOutput = JSON.stringify(this.data, null, 2);
        break;
      case 'tabs':
        this.convertedOutput = this.convertToTabs();
        break;
      case 'csv':
        this.convertedOutput = this.convertToCSV();
        break;
      case 'sql':
        this.convertedOutput = this.convertToSQL();
        break;
      case 'html':
        this.convertedOutput = this.convertToHTML();
        break;
      case 'xml':
        this.convertedOutput = this.convertToXML();
        break;
      case 'markdown':
        this.convertedOutput = this.convertToMarkdown();
        break;
    }
  }

  private convertToTabs(): string {
    if (this.data.length === 0) return '';

    const keys = this.getDataKeys();
    const lines: string[] = [];

    // Add header if needed
    if (this.hasHeaders) {
      lines.push(keys.join('\t'));
    }

    // Add data rows
    this.data.forEach(row => {
      const values = keys.map(key => String(row[key] || ''));
      lines.push(values.join('\t'));
    });

    return lines.join('\n');
  }

  private convertToCSV(): string {
    if (this.data.length === 0) return '';

    const keys = this.getDataKeys();
    const lines: string[] = [];

    // Add header if needed
    if (this.hasHeaders) {
      lines.push(keys.map(key => this.escapeCSV(String(key))).join(','));
    }

    // Add data rows
    this.data.forEach(row => {
      const values = keys.map(key => this.escapeCSV(String(row[key] || '')));
      lines.push(values.join(','));
    });

    return lines.join('\n');
  }

  private convertToSQL(): string {
    if (this.data.length === 0) return '';

    const keys = this.getDataKeys();
    const tableName = this.tableName.replace(/\s+/g, '_');

    // Create table statement
    const createTable = `CREATE TABLE ${tableName} (\n  ${keys.map(key => `${key.replace(/\s+/g, '_')} VARCHAR(255)`).join(',\n  ')}\n);\n\n`;

    // Insert statements
    const inserts = this.data
      .map(row => {
        const values = keys
          .map(key => `'${String(row[key] || '').replace(/'/g, "''")}'`)
          .join(', ');
        return `INSERT INTO ${tableName} (${keys.map(k => k.replace(/\s+/g, '_')).join(', ')}) VALUES (${values});`;
      })
      .join('\n');

    return createTable + inserts;
  }

  private convertToHTML(): string {
    if (this.data.length === 0) return '<table></table>';

    const keys = this.getDataKeys();
    let html = '<table border="1" cellpadding="5" cellspacing="0">\n';

    // Header
    if (this.hasHeaders) {
      html += '  <thead>\n    <tr>\n';
      keys.forEach(key => {
        html += `      <th>${this.escapeHtml(String(key))}</th>\n`;
      });
      html += '    </tr>\n  </thead>\n';
    }

    // Body
    html += '  <tbody>\n';
    this.data.forEach(row => {
      html += '    <tr>\n';
      keys.forEach(key => {
        html += `      <td>${this.escapeHtml(String(row[key] || ''))}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';

    return html;
  }

  private convertToXML(): string {
    if (this.data.length === 0) return '<data></data>';

    const keys = this.getDataKeys();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';

    this.data.forEach(row => {
      xml += '  <row>\n';
      keys.forEach(key => {
        const tagName = String(key)
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_]/g, '');
        xml += `    <${tagName}>${this.escapeXml(String(row[key] || ''))}</${tagName}>\n`;
      });
      xml += '  </row>\n';
    });

    xml += '</data>';
    return xml;
  }

  private convertToMarkdown(): string {
    if (this.data.length === 0) return '';

    const keys = this.getDataKeys();

    // Header row
    let markdown = '| ' + keys.join(' | ') + ' |\n';

    // Separator row
    markdown += '| ' + keys.map(() => '---').join(' | ') + ' |\n';

    // Data rows
    this.data.forEach(row => {
      const values = keys.map(key => String(row[key] || ''));
      markdown += '| ' + values.join(' | ') + ' |\n';
    });

    return markdown;
  }

  // Utility methods
  getDataKeys(): string[] {
    return getQueryResultKeys(this.data);
  }

  formatTableCell(value: unknown): string {
    return formatTableCell(value);
  }

  getCurrentOutput(): string {
    return this.format === 'table' ? JSON.stringify(this.data, null, 2) : this.convertedOutput;
  }

  copyCurrentOutput(): void {
    const output = this.getCurrentOutput();
    navigator.clipboard.writeText(output).then(() => {
      // Could add a toast notification here
    });
  }

  downloadCurrentOutput(): void {
    const output = this.getCurrentOutput();
    const extension = this.getFileExtension();
    const contentType = this.getContentType();

    this.downloadAsFile(output, `data.${extension}`, contentType);
  }

  private getFileExtension(): string {
    switch (this.format) {
      case 'json':
        return 'json';
      case 'tabs':
        return 'tsv';
      case 'csv':
        return 'csv';
      case 'sql':
        return 'sql';
      case 'html':
        return 'html';
      case 'xml':
        return 'xml';
      case 'markdown':
        return 'md';
      default:
        return 'txt';
    }
  }

  private getContentType(): string {
    switch (this.format) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'html':
        return 'text/html';
      case 'xml':
        return 'application/xml';
      default:
        return 'text/plain';
    }
  }

  private downloadAsFile(content: string, filename: string, contentType: string = 'text/plain') {
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

  private escapeCSV(text: string): string {
    // Escape CSV values by wrapping in quotes if they contain commas, quotes, or newlines
    if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
      // Escape any existing quotes by doubling them
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }
}
