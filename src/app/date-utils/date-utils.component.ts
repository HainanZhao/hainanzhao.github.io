import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as dateUtils from '../shared/utils/date-utils';

@Component({
  selector: 'app-date-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-utils.component.html',
  styleUrls: ['./date-utils.component.css']
})
export class DateUtilsComponent {
  dateInput: string = new Date().toISOString().split('T')[0];
  dateResult: string = '';

  formatSelectedDate() {
    const date = new Date(this.dateInput);
    this.dateResult = dateUtils.formatDate(date);
  }

  checkIfToday() {
    const date = new Date(this.dateInput);
    this.dateResult = dateUtils.isToday(date) ? 'Yes, this is today' : 'No, this is not today';
  }

  addDaysToDate() {
    const date = new Date(this.dateInput);
    this.dateResult = dateUtils.formatDate(dateUtils.addDays(date, 7));
  }
}
