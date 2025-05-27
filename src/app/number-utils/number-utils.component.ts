import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as numberUtils from '../shared/utils/number-utils';

@Component({
  selector: 'app-number-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './number-utils.component.html',
  styleUrls: ['./number-utils.component.css']
})
export class NumberUtilsComponent {
  numberInput: number = 123.456;
  minValue: number = 0;
  maxValue: number = 100;
  numberResult: string = '';

  applyRounding() {
    this.numberResult = numberUtils.roundTo(this.numberInput, 2).toString();
  }

  applyFormatCurrency() {
    this.numberResult = numberUtils.formatCurrency(this.numberInput);
  }

  applyClamp() {
    this.numberResult = numberUtils.clamp(this.numberInput, this.minValue, this.maxValue).toString();
  }
}
