import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { UrlStateService } from '../shared/services/url-state.service';
import { Subject, takeUntil } from 'rxjs';
import * as numberUtils from '../shared/utils/number-utils';

interface ConversionResult {
  value: string;
  error?: string;
}

@Component({
  selector: 'app-number-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './number-utils.component.html',
  styleUrls: ['./number-utils.component.css'],
})
export class NumberUtilsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  highlightedSection = '';

  // Basic operations
  numberInput: number = 123.456;
  decimalPlaces: number = 2;
  minValue: number = 0;
  maxValue: number = 100;
  basicResult: string = '';

  // Byte conversion
  bytesInput: number = 1024;
  bytesResult: string = '';
  bytesStringInput: string = '1 GB';
  parsedBytes: string = '';

  // Base conversion
  baseInput: string = '255';
  fromBase: number = 10;
  toBase: number = 16;
  baseResult: ConversionResult = { value: '' };

  // Number formatting
  formatInput: number = 1234567.89;
  locale: string = 'en-US';
  formatResult: string = '';

  // Unit conversion
  unitValue: number = 100;
  fromUnit: string = 'cm';
  toUnit: string = 'm';
  unitResult: ConversionResult = { value: '' };

  // Duration formatting
  durationMs: number = 12345678;
  durationResult: string = '';

  // Math operations
  mathA: number = 48;
  mathB: number = 18;
  mathResults = {
    gcd: '',
    lcm: '',
    isPrimeA: '',
    isPrimeB: '',
  };

  // Financial calculations
  principal: number = 1000;
  rate: number = 0.05;
  time: number = 10;
  frequency: number = 12;
  compoundResult: string = '';

  // Available units for conversion
  unitCategories = {
    length: ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'yard', 'mile'],
    weight: ['mg', 'g', 'kg', 'oz', 'lb'],
  };

  constructor(
    private searchService: SearchService,
    private urlStateService: UrlStateService
  ) {}

  ngOnInit() {
    this.searchService.highlightedSection$.pipe(takeUntil(this.destroy$)).subscribe(sectionId => {
      this.highlightedSection = sectionId;
    });

    // Load state from URL if present
    this.loadStateFromUrl();

    // Initialize with default calculations
    this.performAllCalculations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStateFromUrl() {
    const sharedState = this.urlStateService.getStateFromUrl('numbers');
    if (sharedState) {
      try {
        const state = JSON.parse(sharedState);
        Object.assign(this, state);
      } catch {
        console.warn('Failed to parse shared number state');
      }
    }
  }

  performAllCalculations() {
    this.calculateBasicOps();
    this.convertBytes();
    this.parseByteString();
    this.convertBase();
    this.formatNumber();
    this.convertUnits();
    this.formatDuration();
    this.calculateCompound();
  }

  calculateBasicOps() {
    const rounded = numberUtils.roundTo(this.numberInput, this.decimalPlaces);
    const currency = numberUtils.formatCurrency(this.numberInput);
    const clamped = numberUtils.clamp(this.numberInput, this.minValue, this.maxValue);

    this.basicResult = `Rounded: ${rounded} | Currency: ${currency} | Clamped: ${clamped}`;
  }

  convertBytes() {
    this.bytesResult = numberUtils.formatBytes(this.bytesInput);
  }

  parseByteString() {
    try {
      const parsed = numberUtils.parseBytes(this.bytesStringInput);
      this.parsedBytes = `${numberUtils.formatNumber(parsed)} bytes`;
    } catch {
      this.parsedBytes = 'Invalid format';
    }
  }

  convertBase() {
    try {
      const result = numberUtils.convertBase(this.baseInput, this.fromBase, this.toBase);
      this.baseResult = { value: result };
    } catch (error) {
      this.baseResult = { value: '', error: (error as Error).message };
    }
  }

  formatNumber() {
    this.formatResult = numberUtils.formatNumber(this.formatInput, this.locale);
  }

  convertUnits() {
    try {
      const result = numberUtils.convertUnits(this.unitValue, this.fromUnit, this.toUnit);
      this.unitResult = { value: numberUtils.roundTo(result, 6).toString() };
    } catch (error) {
      this.unitResult = { value: '', error: (error as Error).message };
    }
  }

  formatDuration() {
    this.durationResult = numberUtils.formatDuration(this.durationMs);
  }

  calculateCompound() {
    const result = numberUtils.compoundInterest(
      this.principal,
      this.rate,
      this.time,
      this.frequency
    );
    this.compoundResult = numberUtils.formatCurrency(result);
  }

  generateRandomNumber() {
    this.numberInput = numberUtils.randomBetween(1, 1000) + Math.random();
    this.calculateBasicOps();
  }

  clearAll() {
    // Reset all values to defaults
    this.numberInput = 123.456;
    this.bytesInput = 1024;
    this.baseInput = '255';
    this.fromBase = 10;
    this.toBase = 16;
    this.unitValue = 100;
    this.fromUnit = 'cm';
    this.toUnit = 'm';
    this.mathA = 48;
    this.mathB = 18;
    this.principal = 1000;
    this.rate = 0.05;
    this.time = 10;
    this.frequency = 12;

    this.performAllCalculations();
  }
}
