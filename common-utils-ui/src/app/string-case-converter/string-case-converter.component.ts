import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule here

@Component({
  selector: 'app-string-case-converter',
  standalone: true, // Mark as standalone
  imports: [FormsModule], // Import FormsModule
  templateUrl: './string-case-converter.component.html',
  styleUrls: ['./string-case-converter.component.css']
})
export class StringCaseConverterComponent {
  inputText: string = '';
  convertedText: string = '';

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
    this.convertedText = firstWord + words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }
}
