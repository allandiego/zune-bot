import { MatchType } from '@model/matchmaking/MatchModel';

export interface IScore {
  _id: string;
  matchType: MatchType;
  playerId: string;
  playerUsername: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  eloRating: number;
  eloName: string;
  createdAt: Date;
  updatedAt: Date;
}
