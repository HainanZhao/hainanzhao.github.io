import { Routes } from '@angular/router';
import { CalculatorComponent } from './calculator/calculator.component';
import { StringUtilsComponent } from './string-utils/string-utils.component';
import { CsvToSheetsFormatterComponent } from './csv-to-sheets-formatter/csv-to-sheets-formatter.component';
import { DateUtilsComponent } from './date-utils/date-utils.component';
import { NumberUtilsComponent } from './number-utils/number-utils.component';
import { ArrayUtilsComponent } from './array-utils/array-utils.component';
import { JsonVisualizerComponent } from './json-visualizer/json-visualizer.component';
import { RegexTesterComponent } from './regex-tester/regex-tester.component';

export const routes: Routes = [
  { path: '', redirectTo: '/calculator', pathMatch: 'full' }, // Default route
  { path: 'calculator', component: CalculatorComponent },
  { path: 'string-utils', component: StringUtilsComponent },
  { path: 'csv-formatter', component: CsvToSheetsFormatterComponent },
  { path: 'date-utils', component: DateUtilsComponent },
  { path: 'number-utils', component: NumberUtilsComponent },
  { path: 'array-utils', component: ArrayUtilsComponent },
  { path: 'json-visualizer', component: JsonVisualizerComponent },
  { path: 'regex-tester', component: RegexTesterComponent }
];
