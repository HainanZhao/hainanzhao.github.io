import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { evaluate } from 'mathjs';

@Component({
  selector: 'app-calculator',
  standalone: true, // Mark as standalone
  imports: [FormsModule, CommonModule], // Import FormsModule and CommonModule
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  expression: string = '';
  result: number | string = 0;

  evaluateExpression() {
    try {
      if (!this.expression || this.expression.trim() === '') {
        this.result = ''; // Clear result if expression is empty
        return;
      }
      this.result = evaluate(this.expression);
    } catch (error) {
      this.result = 'Error: Invalid expression';
      console.error('Error evaluating expression:', error);
    }
  }
}
