import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UnitConverterComponent } from './unit-converter.component';

describe('UnitConverterComponent', () => {
  let component: UnitConverterComponent;
  let fixture: ComponentFixture<UnitConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule, CommonModule, UnitConverterComponent ] // Import standalone component directly
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Length Conversion Tests ---
  it('should convert 1 meter to 0.001 kilometers', () => {
    component.inputValue = 1;
    component.fromUnitSymbol = 'm';
    component.toUnitSymbol = 'km';
    component.convert();
    expect(component.result).toBe(0.001);
  });

  it('should convert 1 kilometer to 1000 meters', () => {
    component.inputValue = 1;
    component.fromUnitSymbol = 'km';
    component.toUnitSymbol = 'm';
    component.convert();
    expect(component.result).toBe(1000);
  });

  it('should convert 10 feet to 3.048 meters', () => {
    component.inputValue = 10;
    component.fromUnitSymbol = 'ft';
    component.toUnitSymbol = 'm';
    component.convert();
    expect(component.result).toBe(3.048);
  });

  it('should convert 1 inch to 0.0254 meters', () => {
    component.inputValue = 1;
    component.fromUnitSymbol = 'in';
    component.toUnitSymbol = 'm';
    component.convert();
    expect(component.result).toBe(0.0254);
  });
  
  it('should convert 1 mile to 1609.34 meters', () => {
    component.inputValue = 1;
    component.fromUnitSymbol = 'mi';
    component.toUnitSymbol = 'm';
    component.convert();
    expect(component.result).toBe(1609.34);
  });

  it('should convert 5280 feet to 1 mile', () => {
    component.inputValue = 5280;
    component.fromUnitSymbol = 'ft';
    component.toUnitSymbol = 'mi';
    component.convert();
    // (5280 * 0.3048) / 1609.34 = 1
    expect(component.result).toBeCloseTo(1, 5); // Using toBeCloseTo for potential floating point inaccuracies
  });


  // --- Weight Conversion Tests ---
  it('should convert 1 kilogram to 1000 grams', () => {
    component.inputValue = 1;
    component.fromUnitSymbol = 'kg';
    component.toUnitSymbol = 'g';
    component.convert();
    expect(component.result).toBe(1000);
  });

  it('should convert 1000 grams to 1 kilogram', () => {
    component.inputValue = 1000;
    component.fromUnitSymbol = 'g';
    component.toUnitSymbol = 'kg';
    component.convert();
    expect(component.result).toBe(1);
  });

  it('should convert 1 kilogram to 2.20462 pounds (approx)', () => {
    component.inputValue = 1;
    component.fromUnitSymbol = 'kg';
    component.toUnitSymbol = 'lb';
    component.convert();
    expect(component.result).toBeCloseTo(2.20462, 5);
  });

  it('should convert 1 pound to 0.453592 kilograms', () => {
    component.inputValue = 1;
    component.fromUnitSymbol = 'lb';
    component.toUnitSymbol = 'kg';
    component.convert();
    expect(component.result).toBe(0.453592);
  });
  
  it('should convert 16 ounces to 1 pound', () => {
    component.inputValue = 16;
    component.fromUnitSymbol = 'oz';
    component.toUnitSymbol = 'lb';
    component.convert();
    // (16 * 0.0283495) / 0.453592 = 1
    expect(component.result).toBeCloseTo(1, 5);
  });

  // --- Temperature Conversion Tests ---
  it('should convert 0 Celsius to 32 Fahrenheit', () => {
    component.inputValue = 0;
    component.fromUnitSymbol = 'C';
    component.toUnitSymbol = 'F';
    component.convert();
    expect(component.result).toBe(32);
  });

  it('should convert 32 Fahrenheit to 0 Celsius', () => {
    component.inputValue = 32;
    component.fromUnitSymbol = 'F';
    component.toUnitSymbol = 'C';
    component.convert();
    expect(component.result).toBe(0);
  });

  it('should convert 100 Celsius to 212 Fahrenheit', () => {
    component.inputValue = 100;
    component.fromUnitSymbol = 'C';
    component.toUnitSymbol = 'F';
    component.convert();
    expect(component.result).toBe(212);
  });

  it('should convert 212 Fahrenheit to 100 Celsius', () => {
    component.inputValue = 212;
    component.fromUnitSymbol = 'F';
    component.toUnitSymbol = 'C';
    component.convert();
    expect(component.result).toBe(100);
  });

  it('should convert 0 Celsius to 273.15 Kelvin', () => {
    component.inputValue = 0;
    component.fromUnitSymbol = 'C';
    component.toUnitSymbol = 'K';
    component.convert();
    expect(component.result).toBe(273.15);
  });

  it('should convert 273.15 Kelvin to 0 Celsius', () => {
    component.inputValue = 273.15;
    component.fromUnitSymbol = 'K';
    component.toUnitSymbol = 'C';
    component.convert();
    expect(component.result).toBe(0);
  });
  
  it('should convert 32 Fahrenheit to 273.15 Kelvin', () => {
    component.inputValue = 32;
    component.fromUnitSymbol = 'F';
    component.toUnitSymbol = 'K';
    component.convert(); // (32 - 32) * 5/9 + 273.15
    expect(component.result).toBe(273.15);
  });

  it('should convert 273.15 Kelvin to 32 Fahrenheit', () => {
    component.inputValue = 273.15;
    component.fromUnitSymbol = 'K';
    component.toUnitSymbol = 'F';
    component.convert(); // (273.15 - 273.15) * 9/5 + 32
    expect(component.result).toBe(32);
  });


  // --- Invalid/Edge Case Conversion Tests ---
  it('should return error message for converting meters to kilograms', () => {
    component.inputValue = 10;
    component.fromUnitSymbol = 'm';
    component.toUnitSymbol = 'kg';
    component.convert();
    expect(component.result).toBe('Cannot convert Length to Weight. Please select units from the same category.');
  });

  it('should convert 10 meters to 10 meters (same unit)', () => {
    component.inputValue = 10;
    component.fromUnitSymbol = 'm';
    component.toUnitSymbol = 'm';
    component.convert();
    expect(component.result).toBe(10);
  });
  
  it('should convert 100 Celsius to 100 Celsius (same unit, temperature)', () => {
    component.inputValue = 100;
    component.fromUnitSymbol = 'C';
    component.toUnitSymbol = 'C';
    component.convert();
    expect(component.result).toBe(100);
  });

  it('should return error message if inputValue is null', () => {
    component.inputValue = null;
    component.fromUnitSymbol = 'm';
    component.toUnitSymbol = 'km';
    component.convert();
    expect(component.result).toBe('Please enter a value and select units.');
  });
  
  it('should default fromUnit and toUnit if categories are available', () => {
    // Assuming unitCategories are populated by default in the component
    expect(component.fromUnitSymbol).toBe('m'); // Default from first category, first unit
    expect(component.toUnitSymbol).toBe('m');   // Default from first category, first unit
  });

  it('should set result to "Invalid unit selection." if fromUnit is not found', () => {
    component.inputValue = 10;
    component.fromUnitSymbol = 'invalid_unit';
    component.toUnitSymbol = 'm';
    component.convert();
    expect(component.result).toBe('Invalid unit selection.');
  });

  it('should set result to "Invalid unit selection." if toUnit is not found', () => {
    component.inputValue = 10;
    component.fromUnitSymbol = 'm';
    component.toUnitSymbol = 'invalid_unit_again';
    component.convert();
    expect(component.result).toBe('Invalid unit selection.');
  });

});
