import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExampleBandResult } from '../../../../model/example-data';
import { AlbumResult } from '../../../../model/album-result';
import { SongResult } from '../../../../model/song-result';

@Component({
  selector: 'app-result-text',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './result-text.component.html',
  styleUrl: './result-text.component.css'
})
export class ResultTextComponent {

  @Input() textMode: boolean = true;
  public exampleBandResult: any = ExampleBandResult;
  
  getAlbumStarScore(album: AlbumResult){
    return album.songs.reduce((res: number, song: SongResult) => res += song.starScore, 0);
  }
}
