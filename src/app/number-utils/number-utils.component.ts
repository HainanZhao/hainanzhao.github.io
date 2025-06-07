import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { Subscription } from 'rxjs';
import * as numberUtils from '../shared/utils/number-utils';

@Component({
  selector: 'app-number-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './number-utils.component.html',
  styleUrls: ['./number-utils.component.css'],
})
export class NumberUtilsComponent implements OnInit, OnDestroy {
  numberInput: number = 123.456;
  minValue: number = 0;
  maxValue: number = 100;
  numberResult: string = '';

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
  }

  ngOnDestroy() {
    if (this.highlightSubscription) {
      this.highlightSubscription.unsubscribe();
    }
  }

  applyRounding() {
    this.numberResult = numberUtils.roundTo(this.numberInput, 2).toString();
  }

  applyFormatCurrency() {
    this.numberResult = numberUtils.formatCurrency(this.numberInput);
  }

  applyClamp() {
    this.numberResult = numberUtils
      .clamp(this.numberInput, this.minValue, this.maxValue)
      .toString();
  }
}
