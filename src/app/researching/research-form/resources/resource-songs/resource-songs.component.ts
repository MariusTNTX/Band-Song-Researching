import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ELEMENT_TYPE } from '../../../../model/element-type';
import { INPUT_TYPE } from '../../../../model/input-type';
import { ExtractorComponent } from '../../extractor/extractor.component';
import { SongRowComponent } from './song-row/song-row.component';
import { FormService } from '../../../../services/form.service';

@Component({
  selector: 'app-resource-songs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatButtonModule, 
    SongRowComponent, ExtractorComponent],
  templateUrl: './resource-songs.component.html',
  styleUrl: './resource-songs.component.css'
})
export class ResourceSongsComponent {

  @Input() resource!: FormGroup;
  @Input() tab!: any;
  inputType = INPUT_TYPE;
  elementType = ELEMENT_TYPE;
  public totalSongList!: FormControl;

  constructor(private formService: FormService){ 
    this.totalSongList = formService.songControl;
  }

  songIsIncluded(id: number): boolean {
    return this.totalSongList.value.some((s: any) => s.id === id);
  }

  getSong(id: number): any {
    return this.totalSongList.value.filter((s: any) => s.id === id)[0];
  }
  
  generateSongList(id: string){
    console.log(id);
  }
}
