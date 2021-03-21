import { model, Schema, Model, Document } from 'mongoose';

import { gameType } from '@services/matchmaking/types';

export interface IScore extends Document {
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

const ScoreSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: [
        'switch-singles',
        'switch-doubles',
        'yuzu-singles',
        'yuzu-doubles',
      ],
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
  },
  { timestamps: true },
);

ScoreSchema.index({ type: 1, playerId: 1 }, { unique: true });

const Score: Model<IScore> = model('Score', ScoreSchema);

export default Score;
