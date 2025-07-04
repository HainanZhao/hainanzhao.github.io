import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { UrlStateService } from '../shared/services/url-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-string-utils',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './string-utils.component.html',
  styleUrls: ['./string-utils.component.css'],
})
export class StringUtilsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  highlightedSection = '';

  // Case conversion properties
  inputText = 'Hello World! Visit https://debugi.com/';
  convertedText = '';
  selectedCaseType = '';

  // Random character generation properties
  characterCount: number = 10;
  generatedCharacters: string = '';

  // Text manipulation properties
  manipulatedText: string = '';
  selectedTextOperation = '';

  // Encoding/Decoding properties
  encodedText: string = '';
  decodedText: string = '';

  // Hash generation properties
  hashedText: string = '';

  // Password generation properties
  passwordLength: number = 12;
  includeUppercase: boolean = true;
  includeLowercase: boolean = true;
  includeNumbers: boolean = true;
  includeSymbols: boolean = false;
  generatedPassword: string = '';

  showTextManipulation: boolean = false;
  showEncodingDecoding: boolean = false;
  showHashGeneration: boolean = false;
  showPasswordGenerator: boolean = false;

  showHelp: boolean = false;

  constructor(
    private searchService: SearchService,
    private urlStateService: UrlStateService
  ) {}

  // URL sharing constant
  private readonly TEXT_PARAM_KEY = 'text';

  ngOnInit() {
    // Subscribe to section highlighting
    this.searchService.highlightedSection$.pipe(takeUntil(this.destroy$)).subscribe(sectionId => {
      this.highlightedSection = sectionId;
    });

    // Load text from URL if present
    const savedText = this.urlStateService.getStateFromUrl(this.TEXT_PARAM_KEY);
    if (savedText) {
      this.inputText = savedText;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // URL sharing method
  shareText(event?: Event): void {
    if (!this.inputText) {
      return;
    }
    const buttonElement = event?.target as HTMLElement;
    this.urlStateService.shareUrlWithFeedback(this.TEXT_PARAM_KEY, this.inputText, buttonElement);
  }

  // Update URL when text changes
  updateUrlWithText(): void {
    if (this.inputText) {
      this.urlStateService.updateUrlState(this.TEXT_PARAM_KEY, this.inputText, { replace: true });
    }
  }

  convertToUppercase() {
    this.convertedText = this.inputText.toUpperCase();
  }

  convertToLowercase() {
    this.convertedText = this.inputText.toLowerCase();
  }

  convertToCamelCase() {
    if (!this.inputText) {
      this.convertedText = '';
      return;
    }
    const words = this.inputText.toLowerCase().split(' ');
    const firstWord = words.shift();
    if (!firstWord) {
      this.convertedText = '';
      return;
    }
    this.convertedText =
      firstWord + words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }

  convertToPascalCase() {
    if (!this.inputText) {
      this.convertedText = '';
      return;
    }
    const words = this.inputText.toLowerCase().split(' ');
    this.convertedText = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }

  convertToKebabCase() {
    if (!this.inputText) {
      this.convertedText = '';
      return;
    }
    this.convertedText = this.inputText.toLowerCase().replace(/\s+/g, '-');
  }

  convertToSnakeCase() {
    if (!this.inputText) {
      this.convertedText = '';
      return;
    }
    this.convertedText = this.inputText.toLowerCase().replace(/\s+/g, '_');
  }

  convertToSelectedCase() {
    switch (this.selectedCaseType) {
      case 'uppercase':
        this.convertToUppercase();
        break;
      case 'lowercase':
        this.convertToLowercase();
        break;
      case 'camelCase':
        this.convertToCamelCase();
        break;
      case 'pascalCase':
        this.convertToPascalCase();
        break;
      case 'kebabCase':
        this.convertToKebabCase();
        break;
      case 'snakeCase':
        this.convertToSnakeCase();
        break;
      default:
        this.convertedText = '';
    }
  }

  // Text Analysis Methods
  analyzeText() {
    if (!this.inputText) {
      return;
    }

    const text = this.inputText;
    const words = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);

    // Character frequency
    const charFrequency: Record<string, number> = {};
    for (const char of text) {
      if (char !== ' ' && char !== '\n') {
        charFrequency[char] = (charFrequency[char] || 0) + 1;
      }
    }

    // Word frequency
    const wordFrequency: Record<string, number> = {};
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    }
  }

  // Text Manipulation Methods
  reverseText() {
    this.manipulatedText = this.inputText.split('').reverse().join('');
  }

  removeExtraSpaces() {
    this.manipulatedText = this.inputText.replace(/\s+/g, ' ').trim();
  }

  removeLineBreaks() {
    this.manipulatedText = this.inputText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  addLineNumbers() {
    const lines = this.inputText.split('\n');
    this.manipulatedText = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
  }

  sortLines() {
    const lines = this.inputText.split('\n');
    this.manipulatedText = lines.sort().join('\n');
  }

  removeDuplicateLines() {
    const lines = this.inputText.split('\n');
    const uniqueLines = [...new Set(lines)];
    this.manipulatedText = uniqueLines.join('\n');
  }

  extractEmails() {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = this.inputText.match(emailRegex) || [];
    this.manipulatedText = emails.join('\n');
  }

  extractUrls() {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = this.inputText.match(urlRegex) || [];
    this.manipulatedText = urls.join('\n');
  }

  extractNumbers() {
    const numberRegex = /\b\d+(?:\.\d+)?\b/g;
    const numbers = this.inputText.match(numberRegex) || [];
    this.manipulatedText = numbers.join('\n');
  }

  performTextOperation() {
    switch (this.selectedTextOperation) {
      case 'reverse':
        this.reverseText();
        break;
      case 'removeSpaces':
        this.removeExtraSpaces();
        break;
      case 'removeLineBreaks':
        this.removeLineBreaks();
        break;
      case 'addLineNumbers':
        this.addLineNumbers();
        break;
      case 'sortLines':
        this.sortLines();
        break;
      case 'removeDuplicates':
        this.removeDuplicateLines();
        break;
      default:
        this.manipulatedText = '';
    }
  }

  // Encoding/Decoding Methods
  encodeBase64() {
    try {
      this.encodedText = btoa(this.inputText);
    } catch {
      this.encodedText = 'Error: Unable to encode text';
    }
  }

  decodeBase64() {
    try {
      this.decodedText = atob(this.inputText);
    } catch {
      this.decodedText = 'Error: Invalid Base64 string';
    }
  }

  encodeURL() {
    this.encodedText = encodeURIComponent(this.inputText);
  }

  decodeURL() {
    try {
      this.decodedText = decodeURIComponent(this.inputText);
    } catch {
      this.decodedText = 'Error: Invalid URL encoding';
    }
  }

  encodeHTML() {
    const div = document.createElement('div');
    div.textContent = this.inputText;
    this.encodedText = div.innerHTML;
  }

  decodeHTML() {
    const div = document.createElement('div');
    div.innerHTML = this.inputText;
    this.decodedText = div.textContent || '';
  }

  // Hash Generation Methods
  async generateMD5() {
    // For demo purposes - in production, use a proper crypto library
    this.hashedText = 'MD5 requires external library - showing SHA-256 instead';
    await this.generateSHA256();
  }

  async generateSHA256() {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(this.inputText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      this.hashedText = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      this.hashedText = 'Error generating hash';
    }
  }

  // Password Generation Methods
  generatePassword() {
    let charset = '';

    if (this.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (this.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (this.includeNumbers) charset += '0123456789';
    if (this.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      this.generatedPassword = 'Please select at least one character type';
      return;
    }

    let password = '';
    for (let i = 0; i < this.passwordLength; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    this.generatedPassword = password;
  }

  generateMultiplePasswords(count: number = 5) {
    const passwords = [];
    for (let i = 0; i < count; i++) {
      this.generatePassword();
      passwords.push(this.generatedPassword);
    }
    this.generatedPassword = passwords.join('\n');
  }

  // Utility Methods
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  toggleTextManipulation() {
    this.showTextManipulation = !this.showTextManipulation;
  }

  toggleEncodingDecoding() {
    this.showEncodingDecoding = !this.showEncodingDecoding;
  }

  toggleHashGeneration() {
    this.showHashGeneration = !this.showHashGeneration;
  }

  togglePasswordGenerator() {
    this.showPasswordGenerator = !this.showPasswordGenerator;
  }
}
