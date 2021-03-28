import { model, Schema, Model, Document } from 'mongoose';

import { MatchType } from '@model/matchmaking/MatchModel';
import { matchTypeList } from '@config/match';

export interface IScore extends Document {
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

const ScoreSchema: Schema = new Schema(
  {
    matchType: {
      type: String,
      enum: matchTypeList,
      required: true,
    },
    playerId: {
      type: String,
      required: true,
    },
    playerUsername: {
      type: String,
      required: true,
    },
    wins: {
      type: Number,
      required: true,
      default: 0,
    },
    losses: {
      type: Number,
      required: true,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      required: true,
      default: 0,
    },
    eloRating: {
      type: Number,
      required: true,
      default: 799,
    },
    eloName: {
      type: String,
      required: true,
      default: '',
    },
  },
  { timestamps: true },
);

ScoreSchema.index({ matchType: 1, playerId: 1 }, { unique: true });

const Score: Model<IScore> = model('Score', ScoreSchema);

export default Score;
