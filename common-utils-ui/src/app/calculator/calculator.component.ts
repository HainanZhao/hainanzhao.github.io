import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule here

@Component({
  selector: 'app-calculator',
  standalone: true, // Mark as standalone
  imports: [FormsModule], // Import FormsModule
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  operand1: number = 0;
  operand2: number = 0;
  result: number | string = 0;

  add() {
    this.result = this.operand1 + this.operand2;
  }

  subtract() {
    this.result = this.operand1 - this.operand2;
  }

  multiply() {
    this.result = this.operand1 * this.operand2;
  }

  divide() {
    if (this.operand2 === 0) {
      this.result = 'Error: Division by zero';
    } else {
      this.result = this.operand1 / this.operand2;
    }
  }
}
