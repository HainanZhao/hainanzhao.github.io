import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { Subscription } from 'rxjs';
import * as arrayUtils from '../shared/utils/array-utils';

@Component({
  selector: 'app-array-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './array-utils.component.html',
  styleUrls: ['./array-utils.component.css'],
})
export class ArrayUtilsComponent implements OnInit, OnDestroy {
  arrayInput: string = '1,2,3,4,5';
  arrayResult: string = '';
  rangeInput: number = 10;
  rangeResult: string = '';

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

  shuffleArray() {
    const arr = this.arrayInput.split(',').map(x => x.trim());
    this.arrayResult = arrayUtils.shuffle(arr).join(', ');
  }

  uniqueArray() {
    const arr = this.arrayInput.split(',').map(x => x.trim());
    this.arrayResult = arrayUtils.unique(arr).join(', ');
  }

  createRange() {
    if (this.rangeInput && this.rangeInput > 0) {
      this.rangeResult = arrayUtils.range(1, this.rangeInput).join(', ');
    }
  }
}
