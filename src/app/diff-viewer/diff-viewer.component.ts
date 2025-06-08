import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'context';
  content: string;
  lineNumber?: number;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
}

interface DiffStats {
  additions: number;
  deletions: number;
  totalLines: number;
  changedLines: number;
}

@Component({
  selector: 'app-diff-viewer',
  imports: [CommonModule, FormsModule],
  templateUrl: './diff-viewer.component.html',
  styleUrl: './diff-viewer.component.css',
})
export class DiffViewerComponent implements OnInit {
  // Input content
  originalText = '';
  modifiedText = '';

  // Diff options
  viewMode: 'unified' | 'split' = 'unified';
  ignoreWhitespace = false;
  ignoreCase = false;
  contextLines = 3;
  showLineNumbers = true;
  highlightSyntax = false;

  // Diff results
  diffLines: DiffLine[] = [];
  diffStats: DiffStats = {
    additions: 0,
    deletions: 0,
    totalLines: 0,
    changedLines: 0,
  };

  // UI state
  isProcessing = false;
  isExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Load from URL parameters if present
    this.route.queryParams.subscribe(params => {
      if (params['original']) {
        this.originalText = decodeURIComponent(params['original']);
      }
      if (params['modified']) {
        this.modifiedText = decodeURIComponent(params['modified']);
      }
      if (params['mode']) {
        this.viewMode = params['mode'] as 'unified' | 'split';
      }
      if (params['context']) {
        this.contextLines = parseInt(params['context']) || 3;
      }
      if (params['ignoreWhitespace']) {
        this.ignoreWhitespace = params['ignoreWhitespace'] === 'true';
      }
      if (params['ignoreCase']) {
        this.ignoreCase = params['ignoreCase'] === 'true';
      }

      if (this.originalText || this.modifiedText) {
        this.generateDiff();
      }
    });
  }

  generateDiff() {
    if (!this.originalText && !this.modifiedText) {
      this.diffLines = [];
      this.resetStats();
      return;
    }

    this.isProcessing = true;

    // Process text based on options
    let original = this.originalText;
    let modified = this.modifiedText;

    if (this.ignoreCase) {
      original = original.toLowerCase();
      modified = modified.toLowerCase();
    }

    // Split into lines
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');

    // Generate diff using LCS algorithm
    const lcs = this.longestCommonSubsequence(originalLines, modifiedLines);
    this.diffLines = [];

    let originalIndex = 0;
    let modifiedIndex = 0;
    let lcsIndex = 0;

    while (originalIndex < originalLines.length || modifiedIndex < modifiedLines.length) {
      if (
        lcsIndex < lcs.length &&
        originalIndex < originalLines.length &&
        modifiedIndex < modifiedLines.length &&
        originalLines[originalIndex] === lcs[lcsIndex] &&
        modifiedLines[modifiedIndex] === lcs[lcsIndex]
      ) {
        // Unchanged line
        this.diffLines.push({
          type: 'unchanged',
          content: originalLines[originalIndex],
          originalLineNumber: originalIndex + 1,
          modifiedLineNumber: modifiedIndex + 1,
        });
        originalIndex++;
        modifiedIndex++;
        lcsIndex++;
      } else if (
        originalIndex < originalLines.length &&
        (lcsIndex >= lcs.length || originalLines[originalIndex] !== lcs[lcsIndex])
      ) {
        // Line removed
        this.diffLines.push({
          type: 'removed',
          content: originalLines[originalIndex],
          originalLineNumber: originalIndex + 1,
        });
        originalIndex++;
      } else if (modifiedIndex < modifiedLines.length) {
        // Line added
        this.diffLines.push({
          type: 'added',
          content: modifiedLines[modifiedIndex],
          modifiedLineNumber: modifiedIndex + 1,
        });
        modifiedIndex++;
      }
    }

    // Apply context lines if needed
    if (this.contextLines !== -1) {
      this.diffLines = this.addContextLines(this.diffLines);
    }

    this.calculateStats();
    this.isProcessing = false;
  }

  private longestCommonSubsequence(a: string[], b: string[]): string[] {
    const dp: number[][] = Array(a.length + 1)
      .fill(null)
      .map(() => Array(b.length + 1).fill(0));

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (this.linesEqual(a[i - 1], b[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Reconstruct LCS
    const result: string[] = [];
    let i = a.length;
    let j = b.length;

    while (i > 0 && j > 0) {
      if (this.linesEqual(a[i - 1], b[j - 1])) {
        result.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return result;
  }

  private linesEqual(line1: string, line2: string): boolean {
    if (this.ignoreWhitespace) {
      line1 = line1.replace(/\s+/g, ' ').trim();
      line2 = line2.replace(/\s+/g, ' ').trim();
    }

    if (this.ignoreCase) {
      line1 = line1.toLowerCase();
      line2 = line2.toLowerCase();
    }

    return line1 === line2;
  }

  private addContextLines(diffLines: DiffLine[]): DiffLine[] {
    const result: DiffLine[] = [];
    const changedLineIndexes = new Set<number>();

    // Find all changed lines
    diffLines.forEach((line, index) => {
      if (line.type === 'added' || line.type === 'removed') {
        changedLineIndexes.add(index);
      }
    });

    // Add context around changed lines
    const includeIndexes = new Set<number>();

    changedLineIndexes.forEach(index => {
      for (
        let i = Math.max(0, index - this.contextLines);
        i <= Math.min(diffLines.length - 1, index + this.contextLines);
        i++
      ) {
        includeIndexes.add(i);
      }
    });

    // Build result with context
    const sortedIndexes = Array.from(includeIndexes).sort((a, b) => a - b);
    let lastIndex = -1;

    sortedIndexes.forEach(index => {
      if (index > lastIndex + 1) {
        // Add separator for skipped lines
        result.push({
          type: 'context',
          content: `... ${index - lastIndex - 1} lines skipped ...`,
        });
      }
      result.push(diffLines[index]);
      lastIndex = index;
    });

    return result;
  }

  private calculateStats() {
    this.diffStats = {
      additions: this.diffLines.filter(line => line.type === 'added').length,
      deletions: this.diffLines.filter(line => line.type === 'removed').length,
      totalLines: this.diffLines.filter(line => line.type !== 'context').length,
      changedLines: this.diffLines.filter(line => line.type === 'added' || line.type === 'removed')
        .length,
    };
  }

  private resetStats() {
    this.diffStats = {
      additions: 0,
      deletions: 0,
      totalLines: 0,
      changedLines: 0,
    };
  }

  // Sample data methods
  loadJsonSample() {
    this.originalText = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming"]
}`;

    this.modifiedText = `{
  "name": "John Smith",
  "age": 31,
  "city": "San Francisco",
  "hobbies": ["reading", "cycling", "cooking"],
  "active": true
}`;
    this.generateDiff();
  }

  loadCodeSample() {
    this.originalText = `function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price;
  }
  return total;
}`;

    this.modifiedText = `function calculateTotal(items, taxRate = 0) {
  let total = 0;
  for (const item of items) {
    total += item.price * (1 + item.discount || 0);
  }
  
  return total * (1 + taxRate);
}`;
    this.generateDiff();
  }

  loadTextSample() {
    this.originalText = `The quick brown fox jumps over the lazy dog.
This is a sample text for testing diff functionality.
It contains multiple lines to demonstrate the comparison.`;

    this.modifiedText = `The quick brown fox leaps over the lazy dog.
This is a sample text for testing diff functionality.
It contains several lines to demonstrate the comparison.
Added a new line at the end.`;
    this.generateDiff();
  }

  // Action methods
  clearAll() {
    this.originalText = '';
    this.modifiedText = '';
    this.diffLines = [];
    this.resetStats();
  }

  copyDiff() {
    const diffText = this.diffLines
      .map(line => {
        const prefix =
          line.type === 'added'
            ? '+'
            : line.type === 'removed'
              ? '-'
              : line.type === 'context'
                ? '...'
                : ' ';
        return `${prefix} ${line.content}`;
      })
      .join('\n');

    navigator.clipboard.writeText(diffText).then(() => {
      // Could add toast notification here
    });
  }

  shareState() {
    const params = new URLSearchParams();

    if (this.originalText) {
      params.set('original', encodeURIComponent(this.originalText));
    }
    if (this.modifiedText) {
      params.set('modified', encodeURIComponent(this.modifiedText));
    }
    if (this.viewMode !== 'unified') {
      params.set('mode', this.viewMode);
    }
    if (this.contextLines !== 3) {
      params.set('context', this.contextLines.toString());
    }
    if (this.ignoreWhitespace) {
      params.set('ignoreWhitespace', 'true');
    }
    if (this.ignoreCase) {
      params.set('ignoreCase', 'true');
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      // Could add toast notification here
    });
  }

  swapTexts() {
    const temp = this.originalText;
    this.originalText = this.modifiedText;
    this.modifiedText = temp;
    this.generateDiff();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  onViewModeChange() {
    this.generateDiff();
  }

  onOptionsChange() {
    this.generateDiff();
  }

  formatAsJson(text: string): string {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }

  formatOriginalAsJson() {
    this.originalText = this.formatAsJson(this.originalText);
    this.generateDiff();
  }

  formatModifiedAsJson() {
    this.modifiedText = this.formatAsJson(this.modifiedText);
    this.generateDiff();
  }

  getLinePrefix(type: string): string {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'context':
        return '●';
      default:
        return ' ';
    }
  }

  trackByFn(index: number, item: DiffLine): string {
    return `${index}-${item.type}-${item.content}`;
  }

  getOriginalLines(): DiffLine[] {
    return this.diffLines.filter(
      line => line.type === 'removed' || line.type === 'unchanged' || line.type === 'context'
    );
  }

  getModifiedLines(): DiffLine[] {
    return this.diffLines.filter(
      line => line.type === 'added' || line.type === 'unchanged' || line.type === 'context'
    );
  }
}
