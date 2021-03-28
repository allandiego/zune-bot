import { Score } from '@database/schemas';
import { IScore } from '@model/matchmaking/ScoreModel';

export default class FindRankingService {
  public async execute(filter: any, limit: number): Promise<IScore[] | null> {
    const score = await Score.find(filter)
      .sort({ eloRating: 'desc' })
      .limit(limit)
      .lean();

    return score;
  }
}
