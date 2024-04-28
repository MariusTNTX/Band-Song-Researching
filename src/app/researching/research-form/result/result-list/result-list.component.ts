import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BandResult } from '../../../../model/band-result';
import { ExampleBandResult } from '../../../../model/example-data';
import { SongResult } from '../../../../model/song-result';
import { AlbumResult } from '../../../../model/album-result';

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule,
    MatButtonModule
  ],
  templateUrl: './result-list.component.html',
  styleUrl: './result-list.component.css'
})
export class ResultListComponent {

  public exampleBandResult: BandResult = ExampleBandResult;

  get songList(){
    let songList: any[] = this.exampleBandResult.albums.reduce((res: any[], album: AlbumResult) => {
      return [ ...res, ...album.songs.map((s: any) => ({ ...s, album: { id: album.id, title: album.title } }))];
    }, []);
    return songList.sort((a: any, b: any) => {
      if(b.starScore - a.starScore === 0){
        if(b.topScore() - a.topScore() === 0){
          if(b.scores.length - a.scores.length === 0) return a.totalScore() - b.totalScore();
          return b.scores.length - a.scores.length;
        } 
        return b.topScore() - a.topScore()
      }
      return b.starScore - a.starScore
    });
  }

  scores(song: any){
    return song.scores.join('+');
  }

  updateSongStars(song: any, isAdding: boolean){
    this.exampleBandResult.albums.forEach((a: AlbumResult) => {
      if(a.id === song.album.id) a.songs.forEach((s: SongResult) => {
        if(s.id === song.id){
          switch(s.starScore){
            case 6: s.starScore = 4; break;
            case 4: isAdding ? s.starScore = 6 : s.starScore = 2; break;
            case 2: isAdding ? s.starScore = 4 : s.starScore = 1; break;
            case 1: isAdding ? s.starScore = 2 : s.starScore = 0.5; break;
            case 0.5: s.starScore = 1; break;
          }
        }
        return s;
      });
      return a;
    });
  }
}
