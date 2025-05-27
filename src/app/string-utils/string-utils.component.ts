import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-string-utils',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './string-utils.component.html',
  styleUrls: ['./string-utils.component.css']
})
export class StringUtilsComponent {
  // Case conversion properties
  inputText: string = '';
  convertedText: string = '';

  // Random character generation properties
  characterCount: number = 10;
  generatedCharacters: string = '';

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

  generateRandomCharacters() {
    if (this.characterCount <= 0) {
      this.generatedCharacters = '';
      return;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < this.characterCount; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    this.generatedCharacters = result;
  }

  generateRandomLetters() {
    if (this.characterCount <= 0) {
      this.generatedCharacters = '';
      return;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    
    for (let i = 0; i < this.characterCount; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    this.generatedCharacters = result;
  }

  generateRandomNumbers() {
    if (this.characterCount <= 0) {
      this.generatedCharacters = '';
      return;
    }

    const characters = '0123456789';
    let result = '';
    
    for (let i = 0; i < this.characterCount; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    this.generatedCharacters = result;
  }

  generateRandomSpecialChars() {
    if (this.characterCount <= 0) {
      this.generatedCharacters = '';
      return;
    }

    const characters = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    
    for (let i = 0; i < this.characterCount; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    this.generatedCharacters = result;
  }
}
