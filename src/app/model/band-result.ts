import { AlbumResult } from "./album-result";

export interface BandResult {
  name: string,
  country: string,
  initYear(): number,
  hitSongYears(): number[],
  albums: AlbumResult[]
};