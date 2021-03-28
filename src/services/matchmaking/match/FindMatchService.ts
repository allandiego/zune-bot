import { Match } from '@database/schemas';
import { IMatch } from '@model/matchmaking/MatchModel';

// type IRequest = Partial<IMatch>;

export default class FindMatchService {
  public async execute(filter: any): Promise<IMatch | null> {
    const match = await Match.findOne(filter).lean();

    return match;
  }
}
