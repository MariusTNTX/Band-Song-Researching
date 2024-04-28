import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormService } from '../../../../../services/form.service';
import { MatBadgeModule } from '@angular/material/badge';
import { ResourceList } from '../../../../../model/example-data';

@Component({
  selector: 'app-song-row',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatCheckboxModule, 
    MatSelectModule, MatBadgeModule],
  templateUrl: './song-row.component.html',
  styleUrl: './song-row.component.css'
})
export class SongRowComponent {

  @Input() song!: any;
  @Input() index!: number;
  @Input() isTotalList: boolean = false;
  
  public songControl!: FormControl;
  public albumForm!: FormGroup;
  public resourceForm!: FormGroup;

  private resourceList = ResourceList;

  constructor(private formService: FormService){ 
    this.songControl = formService.songControl;
    this.resourceForm = formService.resourceForm;
  }

  ngOnInit(){
    this.albumForm = this.formService.albumForm;
  }

  get filtered(){
    return this.resourceForm.value.filtered ? this.song.checked : true;
  }

  get duplicatedSong(){
    return this.songControl.value.filter((s: any) => s.title === this.song.title).length > 1;
  }

  get matches(){
    return this.resourceList
    .reduce((res: any, r: any) => {
      return [ ...res, ...this.resourceForm.value[r.id].songList ];
    }, [])
    .filter((s: any) => s === this.song.id).length;
  }

  checkSong(id: number, checked: boolean){
    this.songControl.setValue(this.songControl.value.map((song: any) => {
      song.checked = (song.id === id) ? checked : song.checked;
      return song;
    }));
  }

  updateSongTitle(id: number, event: any){
    this.songControl.setValue(this.songControl.value.map((s: any) => {
      if(s.id === id){
        s.title = event.target.value;
      }
      return s;
    }));
  }

  updateSongAlbumTitle(id: number, album: number){
    this.songControl.setValue(this.songControl.value.map((s: any) => {
      if(s.id === id){
        s.album = album;
      }
      return s;
    }));
  }
}
