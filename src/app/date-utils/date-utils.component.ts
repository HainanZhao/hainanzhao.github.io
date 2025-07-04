import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { Subscription } from 'rxjs';
import * as dateUtils from '../shared/utils/date-utils';

@Component({
  selector: 'app-date-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-utils.component.html',
  styleUrls: ['./date-utils.component.css'],
})
export class DateUtilsComponent implements OnInit, OnDestroy {
  // Input fields
  dateInput: string = new Date().toISOString().split('T')[0];
  timestampInput: string = '';
  isoInput: string = '';
  flexDateInput: string = '';
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  addTimeAmount: number = 1;
  addTimeUnit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' = 'days';
  formatType: string = 'medium';

  // Results
  formatResult: string = '';
  timestampResult: string = '';
  isoResult: string = '';
  relativeResult: string = '';
  validationResult: string = '';
  timezoneResult: string = '';
  addTimeResult: string = '';
  periodResult: string = '';
  businessDayResult: string = '';

  showHelp: boolean = false;

  // Options
  formatOptions = ['short', 'medium', 'long', 'full', 'time', 'datetime', 'date-only', 'time-only'];
  timeUnits: ('years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds')[] = [
    'years',
    'months',
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
  ];

  // Common timezones
  timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  // Search integration
  private highlightSubscription?: Subscription;

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.highlightSubscription = this.searchService.highlightedSection$.subscribe(
      (section: string | null) => {
        if (section) {
          setTimeout(() => {
            const element = document.getElementById(section);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('highlighted');
              setTimeout(() => element.classList.remove('highlighted'), 3000);
            }
          }, 100);
        }
      }
    );

    // Initialize with current values for advanced users
    this.timestampInput = dateUtils.toUnixTimestamp(new Date()).toString();
    this.isoInput = dateUtils.toISOString(new Date());
  }

  ngOnDestroy() {
    if (this.highlightSubscription) {
      this.highlightSubscription.unsubscribe();
    }
  }

  // Format operations
  formatDate() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.formatResult = 'Invalid date';
      return;
    }
    this.formatResult = dateUtils.formatAs(date, this.formatType);
  }

  // Timestamp operations
  convertFromTimestamp() {
    const timestamp = parseInt(this.timestampInput);
    if (isNaN(timestamp)) {
      this.timestampResult = 'Invalid timestamp';
      return;
    }
    const date = dateUtils.fromUnixTimestamp(timestamp);
    this.timestampResult = `${date.toISOString()} (${dateUtils.formatAs(date, 'full')})`;
  }

  convertToTimestamp() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.timestampResult = 'Invalid date';
      return;
    }
    this.timestampResult = dateUtils.toUnixTimestamp(date).toString();
  }

  // ISO operations
  convertFromISO() {
    try {
      const date = dateUtils.fromISOString(this.isoInput);
      this.isoResult = dateUtils.formatAs(date, 'full');
    } catch {
      this.isoResult = 'Invalid ISO string';
    }
  }

  convertToISO() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.isoResult = 'Invalid date';
      return;
    }
    this.isoResult = dateUtils.toISOString(date);
  }

  // Relative time
  getRelativeTime() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.relativeResult = 'Invalid date';
      return;
    }
    this.relativeResult = dateUtils.getRelativeTime(date);
  }

  // Validation
  validateDate() {
    const isValid = dateUtils.isValidDate(this.flexDateInput);
    const parsedDate = dateUtils.parseDate(this.flexDateInput);

    if (isValid && parsedDate) {
      this.validationResult = `Valid! Parsed as: ${dateUtils.formatAs(parsedDate, 'full')}`;
    } else {
      this.validationResult = 'Invalid date format';
    }
  }

  // Timezone operations
  formatInTimezone() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.timezoneResult = 'Invalid date';
      return;
    }
    this.timezoneResult = dateUtils.formatInTimezone(date, this.timezone);
  }

  // Add time operations
  addTime() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.addTimeResult = 'Invalid date';
      return;
    }
    const result = dateUtils.addTime(date, this.addTimeAmount, this.addTimeUnit);
    this.addTimeResult = dateUtils.formatAs(result, 'full');
  }

  // Period operations
  getStartOfWeek() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.periodResult = 'Invalid date';
      return;
    }
    const start = dateUtils.getStartOf(date, 'week');
    const end = dateUtils.getEndOf(date, 'week');
    this.periodResult = `Week: ${dateUtils.formatAs(start, 'medium')} to ${dateUtils.formatAs(end, 'medium')}`;
  }

  getStartOfMonth() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.periodResult = 'Invalid date';
      return;
    }
    const start = dateUtils.getStartOf(date, 'month');
    const end = dateUtils.getEndOf(date, 'month');
    this.periodResult = `Month: ${dateUtils.formatAs(start, 'medium')} to ${dateUtils.formatAs(end, 'medium')}`;
  }

  getStartOfYear() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.periodResult = 'Invalid date';
      return;
    }
    const start = dateUtils.getStartOf(date, 'year');
    const end = dateUtils.getEndOf(date, 'year');
    this.periodResult = `Year: ${dateUtils.formatAs(start, 'medium')} to ${dateUtils.formatAs(end, 'medium')}`;
  }

  // Business day operations
  checkWeekend() {
    const date = new Date(this.dateInput);
    if (isNaN(date.getTime())) {
      this.businessDayResult = 'Invalid date';
      return;
    }
    const isWeekend = dateUtils.isWeekend(date);
    const dayName = dateUtils.formatAs(date, 'full').split(',')[0];
    this.businessDayResult = `${dayName} is ${isWeekend ? 'a weekend' : 'a weekday'}`;
  }

  calculateBusinessDays() {
    const startDate = new Date(this.dateInput);
    if (isNaN(startDate.getTime())) {
      this.businessDayResult = 'Invalid date';
      return;
    }
    const endDate = dateUtils.addTime(startDate, 30, 'days'); // 30 days from start
    const businessDays = dateUtils.getBusinessDays(startDate, endDate);
    this.businessDayResult = `Business days in next 30 days: ${businessDays}`;
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }
}
