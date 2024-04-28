import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { INPUT_TYPE } from '../../../model/input-type';
import { ELEMENT_TYPE } from '../../../model/element-type';
import { extractSpotifyData } from './extractors/spotify-extractor';

@Component({
  selector: 'app-extractor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './extractor.component.html',
  styleUrl: './extractor.component.css'
})
export class ExtractorComponent implements OnInit {

  @Input() formGroup!: FormGroup;
  @Input() elementType!: ELEMENT_TYPE;

  input_type = INPUT_TYPE;
  element_type = ELEMENT_TYPE;

  public inputType!: INPUT_TYPE;

  constructor(){ }

  ngOnInit(){
    this.inputType = this.formGroup.value.inputType;
  }

  generateListByText(){ 
    console.log(this.formGroup.value.rawContent);
    this.formGroup.get("rawContent")?.setValue("");
  }

  generateListByJSON(event: any){ 
    const file: File = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      console.log(extractSpotifyData(JSON.parse(e.target.result), 'JSON'));
    };
    reader.readAsText(file);
  }

}
