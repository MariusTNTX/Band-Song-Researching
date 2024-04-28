import { Component } from '@angular/core';
import { ExampleBandResult } from '../../../model/example-data';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResultTextComponent } from './result-text/result-text.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ResultListComponent } from './result-list/result-list.component';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule,
    MatTabsModule, ResultListComponent, ResultTextComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  public exampleBandResult: any = ExampleBandResult;
  public textMode: boolean = true;
}
