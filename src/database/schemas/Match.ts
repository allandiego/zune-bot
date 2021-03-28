import { model, Schema, Model, Document } from 'mongoose';

import { MatchType } from '@model/matchmaking/MatchModel';
import { matchTypeList } from '@config/match';

interface IMatch extends Document {
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

const MatchSchema: Schema = new Schema(
  {
    matchType: {
      type: String,
      enum: matchTypeList,
      required: true,
    },
    numberOfMatches: {
      type: Number,
      required: true,
    },
    hostPlayerId: {
      type: String,
      required: true,
    },
    team1Players: {
      type: [String],
      required: true,
    },
    team2Players: {
      type: [String],
      required: true,
    },
    scoreReportPlayerId: {
      type: String,
      required: false,
      default: '',
    },
    team1ScoreOrder: {
      type: String,
      required: false,
      default: '',
    },
    team2ScoreOrder: {
      type: String,
      required: false,
      default: '',
    },
    team1Wins: {
      type: Number,
      required: false,
      default: 0,
    },
    team2Wins: {
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
