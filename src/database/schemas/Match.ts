import { model, Schema, Model, Document } from 'mongoose';

import { gameType } from '@services/matchmaking/types';

interface IMatch extends Document {
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

const MatchSchema: Schema = new Schema(
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
    player1Id: {
      type: String,
      required: true,
    },
    player2Id: {
      type: String,
      required: true,
    },
    games: {
      type: Number,
      required: true,
    },
    player1Score: {
      type: Number,
      required: false,
      default: 0,
    },
    player2Score: {
      type: Number,
      required: false,
      default: 0,
    },
    isFinished: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true },
);

const Match: Model<IMatch> = model('Match', MatchSchema);

export default Match;
