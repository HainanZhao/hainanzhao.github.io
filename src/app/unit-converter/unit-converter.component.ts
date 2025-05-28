import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Unit {
  name: string;
  symbol: string;
  category: string;
  factor: number; // Factor relative to a base unit within the category
}

export interface UnitCategory {
  name: string;
  units: Unit[];
  baseUnitSymbol: string; // Symbol of the base unit for this category
}

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-converter.component.html',
  styleUrls: ['./unit-converter.component.css']
})
export class UnitConverterComponent {
  inputValue: number | null = null;
  fromUnitSymbol: string = '';
  toUnitSymbol: string = '';
  result: number | string | null = null;

  unitCategories: UnitCategory[] = [
    {
      name: 'Length',
      baseUnitSymbol: 'm',
      units: [
        { name: 'Meters', symbol: 'm', category: 'Length', factor: 1.0 },
        { name: 'Kilometers', symbol: 'km', category: 'Length', factor: 1000.0 },
        { name: 'Miles', symbol: 'mi', category: 'Length', factor: 1609.34 },
        { name: 'Feet', symbol: 'ft', category: 'Length', factor: 0.3048 },
        { name: 'Inches', symbol: 'in', category: 'Length', factor: 0.0254 },
        { name: 'Centimeters', symbol: 'cm', category: 'Length', factor: 0.01 }
      ]
    },
    {
      name: 'Weight',
      baseUnitSymbol: 'kg',
      units: [
        { name: 'Kilograms', symbol: 'kg', category: 'Weight', factor: 1.0 },
        { name: 'Grams', symbol: 'g', category: 'Weight', factor: 0.001 },
        { name: 'Pounds', symbol: 'lb', category: 'Weight', factor: 0.453592 },
        { name: 'Ounces', symbol: 'oz', category: 'Weight', factor: 0.0283495 },
        { name: 'Milligrams', symbol: 'mg', category: 'Weight', factor: 0.000001 }
      ]
    },
    {
      name: 'Temperature',
      baseUnitSymbol: 'C', // Celsius as base for conceptual grouping, formulas are specific
      units: [
        { name: 'Celsius', symbol: 'C', category: 'Temperature', factor: NaN }, // Factor not used for temp
        { name: 'Fahrenheit', symbol: 'F', category: 'Temperature', factor: NaN },
        { name: 'Kelvin', symbol: 'K', category: 'Temperature', factor: NaN }
      ]
    }
  ];

  // Helper to get all units for easier iteration in template if needed, or for logic
  get allUnits(): Unit[] {
    return this.unitCategories.reduce((acc, category) => acc.concat(category.units), [] as Unit[]);
  }

  constructor() {
    // Set default selections
    if (this.unitCategories.length > 0 && this.unitCategories[0].units.length > 0) {
      this.fromUnitSymbol = this.unitCategories[0].units[0].symbol;
      this.toUnitSymbol = this.unitCategories[0].units[0].symbol;
    }
  }

  convert(): void {
    if (this.inputValue === null || this.fromUnitSymbol === '' || this.toUnitSymbol === '') {
      this.result = 'Please enter a value and select units.';
      return;
    }

    const fromUnit = this.allUnits.find(u => u.symbol === this.fromUnitSymbol);
    const toUnit = this.allUnits.find(u => u.symbol === this.toUnitSymbol);

    if (!fromUnit || !toUnit) {
      this.result = 'Invalid unit selection.';
      return;
    }

    if (fromUnit.category !== toUnit.category) {
      this.result = `Cannot convert ${fromUnit.category} to ${toUnit.category}. Please select units from the same category.`;
      return;
    }

    const value = parseFloat(this.inputValue.toString()); // Ensure it's a float

    // Temperature conversions (special handling)
    if (fromUnit.category === 'Temperature') {
      if (fromUnit.symbol === 'C') {
        if (toUnit.symbol === 'F') {
          this.result = (value * 9/5) + 32;
        } else if (toUnit.symbol === 'K') {
          this.result = value + 273.15;
        } else {
          this.result = value; // C to C
        }
      } else if (fromUnit.symbol === 'F') {
        if (toUnit.symbol === 'C') {
          this.result = (value - 32) * 5/9;
        } else if (toUnit.symbol === 'K') {
          this.result = ((value - 32) * 5/9) + 273.15;
        } else {
          this.result = value; // F to F
        }
      } else if (fromUnit.symbol === 'K') {
        if (toUnit.symbol === 'C') {
          this.result = value - 273.15;
        } else if (toUnit.symbol === 'F') {
          this.result = ((value - 273.15) * 9/5) + 32;
        } else {
          this.result = value; // K to K
        }
      }
    } else {
      // Factor-based conversions for Length, Weight, etc.
      // Convert 'fromUnit' to base unit of its category
      const fromCategory = this.unitCategories.find(cat => cat.name === fromUnit.category);
      if (!fromCategory) {
        this.result = "Error finding unit category.";
        return;
      }
      // No need to find base unit explicitly if factors are already relative to a common base (e.g. meters for length, kg for weight)
      const valueInBaseUnit = value * fromUnit.factor;

      // Convert from base unit to 'toUnit'
      this.result = valueInBaseUnit / toUnit.factor;
    }

    if (typeof this.result === 'number') {
        this.result = parseFloat(this.result.toFixed(5)); // Limit precision
    }
  }
}
