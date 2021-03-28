import { Match } from '@database/schemas';

export default class DeleteMatchService {
  public async execute(matchId: string): Promise<void> {
    await Match.findByIdAndRemove(matchId);
  }
}
