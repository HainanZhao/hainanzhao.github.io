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
  styleUrls: ['./date-utils.component.css']
})
export class DateUtilsComponent implements OnInit, OnDestroy {
  dateInput: string = new Date().toISOString().split('T')[0];
  dateResult: string = '';

  // Search integration
  private highlightSubscription?: Subscription;

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.highlightSubscription = this.searchService.highlightedSection$.subscribe((section: string | null) => {
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
    });
  }

  ngOnDestroy() {
    if (this.highlightSubscription) {
      this.highlightSubscription.unsubscribe();
    }
  }

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
