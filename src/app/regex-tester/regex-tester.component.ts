import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface RegexMatch {
  match: string;
  index: number;
  groups?: string[];
  namedGroups?: { [key: string]: string };
}

interface TestResult {
  isValid: boolean;
  matches: RegexMatch[];
  flags: string;
  errorMessage?: string;
}

@Component({
  selector: 'app-regex-tester',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './regex-tester.component.html',
  styleUrls: ['./regex-tester.component.css']
})
export class RegexTesterComponent {
  regexPattern: string = '';
  testString: string = '';
  flags: string = 'g';
  testResult: TestResult | null = null;
  
  // Predefined regex examples
  regexExamples = [
    {
      name: 'Email Validation',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      flags: 'g',
      testString: 'Contact us at john.doe@example.com or support@company.org for help.'
    },
    {
      name: 'Phone Number (US)',
      pattern: '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})',
      flags: 'g',
      testString: 'Call us at (555) 123-4567 or 555.987.6543 or 555-111-2222'
    },
    {
      name: 'URL Detection',
      pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
      flags: 'gi',
      testString: 'Visit https://www.example.com or http://github.com/user/repo for more info.'
    },
    {
      name: 'Date Format (MM/DD/YYYY)',
      pattern: '(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d\\d',
      flags: 'g',
      testString: 'Important dates: 12/25/2024, 01/01/2025, 07/04/2024'
    },
    {
      name: 'HTML Tags',
      pattern: '<\\/?([a-z]+)[^>]*>',
      flags: 'gi',
      testString: '<div class="container"><p>Hello <strong>world</strong>!</p></div>'
    },
    {
      name: 'IPv4 Address',
      pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
      flags: 'g',
      testString: 'Server IPs: 192.168.1.1, 10.0.0.1, 255.255.255.255, invalid: 999.999.999.999'
    },
    {
      name: 'Hexadecimal Colors',
      pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
      flags: 'g',
      testString: 'Colors: #ff0000, #00FF00, #blue (invalid), #123456, #abc'
    },
    {
      name: 'Credit Card Numbers',
      pattern: '\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b',
      flags: 'g',
      testString: 'Cards: 1234 5678 9012 3456, 4567-8901-2345-6789, 1234567890123456'
    }
  ];

  testRegex() {
    if (!this.regexPattern || !this.testString) {
      this.testResult = null;
      return;
    }

    try {
      const regex = new RegExp(this.regexPattern, this.flags);
      const matches: RegexMatch[] = [];
      
      if (this.flags.includes('g')) {
        // Global flag - find all matches
        let match;
        while ((match = regex.exec(this.testString)) !== null) {
          const regexMatch: RegexMatch = {
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          };
          
          // Handle named groups if they exist
          if (match.groups) {
            regexMatch.namedGroups = match.groups;
          }
          
          matches.push(regexMatch);
          
          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        // Single match
        const match = regex.exec(this.testString);
        if (match) {
          const regexMatch: RegexMatch = {
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          };
          
          if (match.groups) {
            regexMatch.namedGroups = match.groups;
          }
          
          matches.push(regexMatch);
        }
      }

      this.testResult = {
        isValid: true,
        matches: matches,
        flags: this.flags
      };
    } catch (error) {
      this.testResult = {
        isValid: false,
        matches: [],
        flags: this.flags,
        errorMessage: error instanceof Error ? error.message : 'Invalid regex pattern'
      };
    }
  }

  loadExample(example: any) {
    this.regexPattern = example.pattern;
    this.flags = example.flags;
    this.testString = example.testString;
    this.testRegex();
  }

  clearAll() {
    this.regexPattern = '';
    this.testString = '';
    this.flags = 'g';
    this.testResult = null;
  }

  onInputChange() {
    this.testRegex();
  }

  highlightMatches(): string {
    if (!this.testResult || !this.testResult.isValid || this.testResult.matches.length === 0) {
      return this.testString;
    }

    let highlightedText = this.testString;
    let offset = 0;

    // Sort matches by index to highlight in order
    const sortedMatches = [...this.testResult.matches].sort((a, b) => a.index - b.index);

    for (const match of sortedMatches) {
      const startIndex = match.index + offset;
      const endIndex = startIndex + match.match.length;
      
      const before = highlightedText.substring(0, startIndex);
      const highlighted = `<span class="highlight">${match.match}</span>`;
      const after = highlightedText.substring(endIndex);
      
      highlightedText = before + highlighted + after;
      offset += highlighted.length - match.match.length;
    }

    return highlightedText;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }

  getRegexExplanation(): string {
    if (!this.regexPattern) return '';
    
    // Basic regex explanation - could be enhanced with a more sophisticated parser
    let explanation = 'Pattern breakdown:\n';
    
    if (this.regexPattern.includes('^')) explanation += '^ - Start of string\n';
    if (this.regexPattern.includes('$')) explanation += '$ - End of string\n';
    if (this.regexPattern.includes('\\d')) explanation += '\\d - Any digit (0-9)\n';
    if (this.regexPattern.includes('\\w')) explanation += '\\w - Any word character (a-z, A-Z, 0-9, _)\n';
    if (this.regexPattern.includes('\\s')) explanation += '\\s - Any whitespace character\n';
    if (this.regexPattern.includes('.')) explanation += '. - Any character except newline\n';
    if (this.regexPattern.includes('*')) explanation += '* - Zero or more of the preceding element\n';
    if (this.regexPattern.includes('+')) explanation += '+ - One or more of the preceding element\n';
    if (this.regexPattern.includes('?')) explanation += '? - Zero or one of the preceding element\n';
    if (this.regexPattern.includes('|')) explanation += '| - OR operator\n';
    if (this.regexPattern.includes('[')) explanation += '[] - Character class\n';
    if (this.regexPattern.includes('(')) explanation += '() - Capturing group\n';
    
    return explanation;
  }
}
