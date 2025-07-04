import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { UrlStateService } from '../shared/services/url-state.service';
import { Subscription } from 'rxjs';
import { evaluate } from 'mathjs';
import { ActivatedRoute, Router } from '@angular/router';

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
  showExamples: boolean = false;
  showHelp: boolean = false;

  // Search integration
  private highlightSubscription?: Subscription;
  private readonly EXPRESSION_PARAM_KEY = 'expr';

  constructor(
    private searchService: SearchService,
    private urlStateService: UrlStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Handle URL parameters
    this.route.queryParams.subscribe(params => {
      if (params['expr']) {
        try {
          // Decode the expression from the URL
          this.expression = decodeURIComponent(params['expr']);
          this.evaluateExpression(false); // Don't update URL to avoid infinite loop
        } catch (error) {
          console.error('Error decoding expression from URL:', error);
        }
      }
    });

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

  evaluateExpression(updateUrl: boolean = true) {
    try {
      if (!this.expression || this.expression.trim() === '') {
        this.result = ''; // Clear result if expression is empty

        // Clear URL parameter if enabled
        if (updateUrl) {
          this.updateUrlWithExpression('');
        }
        return;
      }

      // Handle "where" expressions (e.g., "2x^2 - 5x + 3 where x = 2")
      if (this.expression.includes(' where ')) {
        const [expr, assignment] = this.expression.split(' where ');
        const [variable, value] = assignment.split('=').map(part => part.trim());
        const substitutedExpr = expr.replace(new RegExp(variable, 'g'), `(${value})`);
        this.result = evaluate(substitutedExpr);
      } else {
        this.result = evaluate(this.expression);
      }

      // Format result for better readability if it's a number
      if (typeof this.result === 'number') {
        // Use toFixed() for long decimals but preserve integers
        this.result =
          this.result % 1 !== 0 && Math.abs(this.result) < 10000
            ? parseFloat(this.result.toFixed(6))
            : this.result;
      }

      // Update URL with current expression if enabled
      if (updateUrl) {
        this.updateUrlWithExpression(this.expression);
      }
    } catch (error) {
      this.result = 'Error: Invalid expression';
      console.error('Error evaluating expression:', error);

      // Still update URL with current expression if enabled
      if (updateUrl) {
        this.updateUrlWithExpression(this.expression);
      }
    }
  }

  // Helper method to update the URL with the current expression
  private updateUrlWithExpression(expression: string): void {
    // Navigate to the same page but with updated query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: expression ? { expr: encodeURIComponent(expression) } : {},
      queryParamsHandling: 'merge', // Keep other query params
      replaceUrl: true, // Replace the URL in the browser history
    });
  }

  // Complex math examples
  loadSimpleExample() {
    this.expression = '(2 + 3) * 4 - 6';
    this.evaluateExpression(true);
  }

  loadTrigExample() {
    this.expression = 'sin(45 deg) + cos(30 deg)';
    this.evaluateExpression(true);
  }

  loadAlgebraExample() {
    this.expression = '2x^2 - 5x + 3 where x = 2';
    this.evaluateExpression(true);
  }

  loadMatrixExample() {
    this.expression = 'det([1, 2; 3, 4])';
    this.evaluateExpression(true);
  }

  loadCalculusExample() {
    this.expression = 'derivative("x^2 + 2*x", "x")';
    this.evaluateExpression(true);
  }

  loadStatisticsExample() {
    this.expression = 'mean([1, 2, 3, 4, 5]) + std([1, 2, 3, 4, 5])';
    this.evaluateExpression(true);
  }

  loadUnitConversionExample() {
    this.expression = '5 inch to cm';
    this.evaluateExpression(true);
  }

  loadFinancialExample() {
    // Calculate monthly payment for a loan: P * r * (1 + r)^n / ((1 + r)^n - 1)
    // where P = principal, r = monthly interest rate, n = number of payments
    this.expression = '25000 * (0.07/12) * (1 + 0.07/12)^(5*12) / ((1 + 0.07/12)^(5*12) - 1)';
    this.evaluateExpression(true);
  }

  // Share the current calculation by copying the URL to clipboard
  shareCalculation(event?: Event): void {
    // Ensure URL is updated with current expression
    this.updateUrlWithExpression(this.expression);

    const buttonElement = event?.target as HTMLElement;
    this.urlStateService.shareUrlWithFeedback(
      this.EXPRESSION_PARAM_KEY,
      this.expression,
      buttonElement
    );
  }

  toggleExamples() {
    this.showExamples = !this.showExamples;
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }
}
