import { gameType } from '../types';

export interface IMatch {
  _id: string;
  type: gameType;
  player1Id: string;
  player2Id: string;
  games: number;
  player1Score: number;
  player2Score: number;
  isFinished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
