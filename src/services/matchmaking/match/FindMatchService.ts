import { Match } from '@database/schemas';
import { IMatch } from './types';

// type IRequest = Partial<IMatch>;

export default class FindMatchService {
  public async execute(filter: any): Promise<IMatch | null> {
    const match = await Match.findOne(filter).lean();
    // const match = await Match.find(filter).sort({ createdAt: 'DESC' }).limit(1);

    return match;
    // throw new Error('teste');
  }
}
