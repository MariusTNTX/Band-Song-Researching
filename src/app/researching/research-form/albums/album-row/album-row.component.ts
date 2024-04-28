import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormService } from '../../../../services/form.service';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-album-row',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatChipsModule, MatIconModule, MatBadgeModule],
  templateUrl: './album-row.component.html',
  styleUrl: './album-row.component.css'
})
export class AlbumRowComponent {

  @Input() album!: any;
  public albumForm!: FormGroup;
  public totalSongList!: FormControl;

  constructor(private formService: FormService){ }

  ngOnInit(){
    this.albumForm = this.formService.albumForm;
    this.totalSongList = this.formService.songControl;
  }

  get totalSongs(){
    return this.totalSongList.value.filter((s: any) => s.album === this.album.id && s.checked).length;
  }

  get filtered(){
    return this.albumForm.value.filtered ? this.totalSongs > 0 : true;
  }

  removeGenre(albumId: number, genre: string) {
    let newAlbumList = this.albumForm.get('albumList')?.value;
    this.albumForm.get('albumList')?.setValue(newAlbumList.map((a: any) => {
      if(a.id === albumId){
        a.genres = a.genres.filter((g: string) => g !== genre);
      }
      return a;
    }));
  }

  addGenre(albumId: number, event: MatChipInputEvent): void {
    const genre = (event.value || '').trim();
    if (genre) {
      let newAlbumList = this.albumForm.get('albumList')?.value;
      this.albumForm.get('albumList')?.setValue(newAlbumList.map((a: any) => {
        if(a.id === albumId) a.genres.push(genre);
        return a;
      }));
    }
    event.chipInput!.clear();
  }

  updateAlbumTitle(id: number, event: any){
    const albumControl = this.albumForm.get('albumList');
    albumControl?.setValue(albumControl?.value.map((a: any) => {
      if(a.id === id){
        a.title = event.target.value;
      }
      return a;
    }));
  }
}
