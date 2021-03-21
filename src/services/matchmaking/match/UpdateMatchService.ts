import { Match } from '@database/schemas';
import { IMatch } from './types';

// type IRequest = Partial<IMatch>;
type IRequest = IMatch;

export default class UpdateMatchService {
  public async execute(match: IRequest): Promise<IMatch | undefined> {
    const updatedMatch = await Match.findByIdAndUpdate(
      match._id,
      {
        type: match.type,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        player1Score: match.player1Score,
        player2Score: match.player2Score,
        games: match.games,
        isFinished: match.isFinished,
      },
      { new: true }, // return updated record
    );

    const responseUpdatedMatch = await updatedMatch?.save();
    return responseUpdatedMatch;
  }
}
