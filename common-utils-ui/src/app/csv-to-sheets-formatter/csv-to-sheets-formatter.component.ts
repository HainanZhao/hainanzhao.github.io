import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule here

@Component({
  selector: 'app-csv-to-sheets-formatter',
  standalone: true, // Mark as standalone
  imports: [FormsModule], // Import FormsModule
  templateUrl: './csv-to-sheets-formatter.component.html',
  styleUrls: ['./csv-to-sheets-formatter.component.css']
})
export class CsvToSheetsFormatterComponent {
  csvInput: string = '';
  sheetsOutput: string = '';

  formatForSheets() {
    // Replace commas with tab characters for Google Sheets compatibility
    this.sheetsOutput = this.csvInput.replace(/,/g, '\t');
  }
}
