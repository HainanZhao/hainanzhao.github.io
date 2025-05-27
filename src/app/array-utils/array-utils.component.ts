import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as arrayUtils from '../shared/utils/array-utils';

@Component({
  selector: 'app-array-utils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './array-utils.component.html',
  styleUrls: ['./array-utils.component.css']
})
export class ArrayUtilsComponent {
  arrayInput: string = '1,2,3,4,5';
  arrayResult: string = '';
  rangeInput: number = 10;
  rangeResult: string = '';

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
