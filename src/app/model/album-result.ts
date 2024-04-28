import { SongResult } from "./song-result";

export interface AlbumResult {
  id: number,
  year: number,
  title: string,
  genres: string[],
  songs: SongResult[]
};