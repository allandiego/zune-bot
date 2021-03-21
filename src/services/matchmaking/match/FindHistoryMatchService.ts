import { Match } from '@database/schemas';
import { IMatch } from './types';

export default class FindHistoryMatchService {
  public async execute(filter: any, limit: number): Promise<IMatch[]> {
    const matchList = await Match.find(filter)
      .sort({ createdAt: 'DESC' })
      .limit(limit)
      .lean();

    return matchList;
  }
}
