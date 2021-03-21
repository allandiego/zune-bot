import { Match } from '@database/schemas';
import { IMatch } from './types';

type IRequest = Omit<
  IMatch,
  | '_id'
  | 'player1Score'
  | 'player2Score'
  | 'isFinished'
  | 'createdAt'
  | 'updatedAt'
>;

export default class CreateMatchService {
  public async execute({
    type,
    player1Id,
    player2Id,
    games,
  }: IRequest): Promise<IMatch> {
    const newMatch = new Match({
      type,
      player1Id,
      player2Id,
      games,
    });

    const newMatchReponse = await newMatch.save();
    return newMatchReponse;
  }
}
