import { Match } from '@database/schemas';
import { IMatch, MatchType } from '@model/matchmaking/MatchModel';

interface IRequest {
  playerId: string;
  matchType: MatchType;
}

export default class FindHistoryMatchService {
  public async execute(
    { playerId }: IRequest,
    limit: number,
  ): Promise<IMatch[]> {
    const matchList = await Match.find({
      $or: [
        { team1Players: playerId, isFinished: true },
        { team2Players: playerId, isFinished: true },
        // $in = OR | $all = AND
        // { team1Players: { $all: [playerId] }, isFinished: false },
        // { team2Players: { $all: [playerId] }, isFinished: false },
      ],
    })
      .sort({ createdAt: 'DESC' })
      .limit(limit)
      .lean();

    return matchList;
  }
}
