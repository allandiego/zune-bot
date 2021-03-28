export type MatchType = 'game1' | 'game2' | 'game3' | 'game4';

export interface IMatch {
  _id: string;
  matchType: MatchType;
  numberOfMatches: number;
  hostPlayerId: string;
  team1Players: string[];
  team2Players: string[];
  scoreReportPlayerId: string;
  team1ScoreOrder: string;
  team2ScoreOrder: string;
  team1Wins: number;
  team2Wins: number;
  isFinished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
