export interface SongResult {
  id: number,
  title: string,
  starScore: number,
  scores: number[],
  totalScore(): number,
  topScore(): number,
};