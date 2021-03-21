import { gameType } from '../types';

export interface IScore {
  _id: string;
  type: gameType;
  playerId: string;
  playerUsername: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  eloRating: number;
  createdAt: Date;
  updatedAt: Date;
}
