import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { Subscription } from 'rxjs';
import { evaluate } from 'mathjs';

@Component({
  selector: 'app-calculator',
  standalone: true, // Mark as standalone
  imports: [FormsModule, CommonModule], // Import FormsModule and CommonModule
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
})
export class CalculatorComponent implements OnInit, OnDestroy {
  expression: string = '';
  result: number | string = 0;

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
