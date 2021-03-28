import { Match } from '@database/schemas';
import { IMatch } from '@model/matchmaking/MatchModel';

// type IRequest = Partial<IMatch>;
interface IRequest {
  playerId: string;
}

export default class FindUnfinishedMatchService {
  public async execute({ playerId }: IRequest): Promise<IMatch | null> {
    const match = await Match.findOne({
      $or: [
        { team1Players: playerId, isFinished: false },
        { team2Players: playerId, isFinished: false },
        // $in = OR | $all = AND
        // { team1Players: { $all: [playerId] }, isFinished: false },
        // { team2Players: { $all: [playerId] }, isFinished: false },
      ],
    }).lean();

    return match;
  }
}
