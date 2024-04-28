import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormService } from '../../../../services/form.service';
import { ExtractorComponent } from '../../extractor/extractor.component';
import { SongRowComponent } from '../resource-songs/song-row/song-row.component';
import { ResourceList } from '../../../../model/example-data';

@Component({
  selector: 'app-total-songs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatButtonModule, 
    SongRowComponent, ExtractorComponent],
  templateUrl: './total-songs.component.html',
  styleUrl: './total-songs.component.css'
})
export class TotalSongsComponent {

  public totalSongList!: FormControl;
  public resourceForm!: FormGroup;
  private resourceList = ResourceList;

  constructor(private formService: FormService){ 
    this.totalSongList = formService.songControl;
    this.resourceForm = formService.resourceForm;
  }

  get sortedSongList(){
    return this.totalSongList.value.sort((a: any, b: any) => a.title.localeCompare(b.title));
  }

  get duplicatedSongs(): boolean {
    return this.totalSongList.value.some((song: any, index: number) => {
      return this.totalSongList.value.some((s: any, i: number) => s.title === song.title && index !== i);
    });
  }

  clearDuplicates(){
    //Obtener un array de arrays de duplicados de songControl
    const duplicatedList = this.totalSongList.value.reduce((res: any, song: any) => {
      let songIds = this.totalSongList.value.filter((s: any) => {
        return s.title === song.title && !res.some((r: any[]) => r.includes(song.id))
      }).map((s: any) => s.id);
      return songIds.length > 1 && !res.includes[songIds] ? [ ...res, songIds] : res;
    }, []);
    
    //Recorrer songControl y resources y sustituir los IDs duplicados por el primer ID de cada array
    //Recorrer songControl y resources y eliminar los últimos IDs duplicados 
    this.totalSongList.setValue(this.totalSongList.value.map((song: any) => {
      duplicatedList.map((group: any) => group.includes(song.id) && (song.id = group[0]));
      return song;
    }).filter((song: any, index: number) => this.totalSongList.value.findIndex((s: any) => s.id === song.id) === index));

    this.resourceList.map((resource: any) => {
      let songList = this.resourceForm.value[resource.id].songList;
      this.resourceForm.get(resource.id)?.get('songList')?.setValue(songList.map((songId: any) => {
        duplicatedList.map((group: any) => group.includes(songId) && (songId = group[0]));
        return songId;
      }).filter((songId: any, index: number, list: any) => list.findIndex((id: any) => id === songId) === index));
    });
  }
}
