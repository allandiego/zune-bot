import { Score, Match } from '@database/schemas';

export default class DeleteScoreService {
  public async execute(): Promise<boolean> {
    const scoreSession = await Score.startSession();

    await scoreSession.withTransaction(async () => {
      await Score.collection.drop();
      await Match.collection.drop();
    });

    scoreSession.endSession();
    return true;
  }
}
