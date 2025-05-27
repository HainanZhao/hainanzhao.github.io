import { Routes } from '@angular/router';
import { CalculatorComponent } from './calculator/calculator.component';
import { StringCaseConverterComponent } from './string-case-converter/string-case-converter.component';
import { CsvToSheetsFormatterComponent } from './csv-to-sheets-formatter/csv-to-sheets-formatter.component';

export const routes: Routes = [
  { path: '', redirectTo: '/calculator', pathMatch: 'full' }, // Default route
  { path: 'calculator', component: CalculatorComponent },
  { path: 'string-converter', component: StringCaseConverterComponent },
  { path: 'csv-formatter', component: CsvToSheetsFormatterComponent }
];
