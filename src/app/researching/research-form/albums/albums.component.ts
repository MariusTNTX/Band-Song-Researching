import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormService } from '../../../services/form.service';
import { AlbumRowComponent } from './album-row/album-row.component';
import { ExtractorComponent } from '../extractor/extractor.component';
import { ELEMENT_TYPE } from '../../../model/element-type';
import { INPUT_TYPE } from '../../../model/input-type';


@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, AlbumRowComponent, ExtractorComponent],
  templateUrl: './albums.component.html',
  styleUrl: './albums.component.css'
})
export class AlbumsComponent {

  public albumForm!: FormGroup;
  inputType = INPUT_TYPE;
  elementType = ELEMENT_TYPE;

  constructor(private formService: FormService){ }

  get filtered(){
    return this.albumForm.value.filtered;
  }

  ngOnInit(){
    this.albumForm = this.formService.albumForm;
  }
  
  generateAlbumList(){
    console.log(this.albumForm.value.rawContent);
    this.albumForm.get("rawContent")?.setValue("");
  }

  toggleResourceFilter(){
    this.albumForm.get('filtered')?.setValue(!this.albumForm.value.filtered);
  }
}
