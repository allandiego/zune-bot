import { Match } from '@database/schemas';
import { IMatch } from '@model/matchmaking/MatchModel';

// type IRequest = Partial<IMatch>;
type IRequest = IMatch;

export default class UpdateMatchService {
  public async execute(match: IRequest): Promise<IMatch | undefined> {
    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        scoreReportPlayerId: match.scoreReportPlayerId,
        team1ScoreOrder: match.team1ScoreOrder,
        team2ScoreOrder: match.team2ScoreOrder,
        team1Wins: match.team1Wins,
        team2Wins: match.team2Wins,
        isFinished: match.isFinished,
      },
      { new: true }, // return updated record
    );

    const responseUpdatedMatch = await updatedMatch?.save();
    return responseUpdatedMatch;
  }
}
