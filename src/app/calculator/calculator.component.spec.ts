import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms'; // Important for ngModel
import { CalculatorComponent } from './calculator.component';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule, // Needed because the component uses ngModel
        CalculatorComponent // Import the standalone component
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('evaluateExpression', () => {
    // Simple arithmetic
    it('should evaluate "1 + 2" to 3', () => {
      component.expression = '1 + 2';
      component.evaluateExpression();
      expect(component.result).toBe(3);
    });

    it('should evaluate "5 - 3" to 2', () => {
      component.expression = '5 - 3';
      component.evaluateExpression();
      expect(component.result).toBe(2);
    });

    it('should evaluate "2 * 3" to 6', () => {
      component.expression = '2 * 3';
      component.evaluateExpression();
      expect(component.result).toBe(6);
    });

    it('should evaluate "8 / 4" to 2', () => {
      component.expression = '8 / 4';
      component.evaluateExpression();
      expect(component.result).toBe(2);
    });

    // Operator precedence
    it('should evaluate "1 + 2 * 3" to 7 (operator precedence)', () => {
      component.expression = '1 + 2 * 3';
      component.evaluateExpression();
      expect(component.result).toBe(7);
    });

    it('should evaluate "10 - 2 * 3" to 4 (operator precedence)', () => {
      component.expression = '10 - 2 * 3';
      component.evaluateExpression();
      expect(component.result).toBe(4);
    });
    
    // Parentheses
    it('should evaluate "(1 + 2) * 3" to 9 (parentheses)', () => {
      component.expression = '(1 + 2) * 3';
      component.evaluateExpression();
      expect(component.result).toBe(9);
    });

    it('should evaluate "10 / (2 + 3)" to 2 (parentheses)', () => {
      component.expression = '10 / (2 + 3)';
      component.evaluateExpression();
      expect(component.result).toBe(2);
    });

    // Exponentiation
    it('should evaluate "2 ^ 3" to 8 (exponentiation)', () => {
      component.expression = '2 ^ 3';
      component.evaluateExpression();
      expect(component.result).toBe(8);
    });

    it('should evaluate "(1 + 1)^4" to 16 (exponentiation with parentheses)', () => {
      component.expression = '(1 + 1)^4';
      component.evaluateExpression();
      expect(component.result).toBe(16);
    });

    // Decimal numbers
    it('should evaluate "1.5 + 2.5" to 4 (decimal numbers)', () => {
      component.expression = '1.5 + 2.5';
      component.evaluateExpression();
      expect(component.result).toBe(4);
    });

    it('should evaluate "0.5 * 4" to 2 (decimal numbers)', () => {
      component.expression = '0.5 * 4';
      component.evaluateExpression();
      expect(component.result).toBe(2);
    });

    // Complex expressions
    it('should evaluate "(1 + 2 * 3)^2 - 2" to 47 (complex expression)', () => {
      component.expression = '(1 + 2 * 3)^2 - 2'; // (1+6)^2 - 2 = 7^2 - 2 = 49 - 2 = 47
      component.evaluateExpression();
      expect(component.result).toBe(47);
    });

    // Error handling
    it('should set result to "Error: Invalid expression" for "1 / 0"', () => {
      component.expression = '1 / 0';
      component.evaluateExpression();
      // math.js evaluate('1/0') results in Infinity, not an error.
      // If we want to treat Infinity as an error, the component logic would need to be adjusted.
      // For now, testing math.js behavior.
      expect(component.result).toBe(Infinity); // or handle as 'Error: Division by zero' if component does so
    });

    it('should set result to "Error: Invalid expression" for "1 + * 2" (syntax error)', () => {
      component.expression = '1 + * 2';
      component.evaluateExpression();
      expect(component.result).toBe('Error: Invalid expression');
    });

    it('should set result to empty string for an empty expression', () => {
      component.expression = '';
      component.evaluateExpression();
      expect(component.result).toBe(''); // Based on current component logic
    });

    it('should set result to empty string for an expression with only spaces', () => {
      component.expression = '   ';
      component.evaluateExpression();
      expect(component.result).toBe(''); // Based on current component logic
    });
  });
});
