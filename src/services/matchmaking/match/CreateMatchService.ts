import { Match } from '@database/schemas';
import { IMatch, MatchType } from '@model/matchmaking/MatchModel';

interface IRequest {
  matchType: MatchType;
  numberOfMatches: number;
  hostPlayerId: string;
  team1Players: string[];
  team2Players: string[];
}

export default class CreateMatchService {
  public async execute({
    matchType,
    numberOfMatches,
    hostPlayerId,
    team1Players,
    team2Players,
  }: IRequest): Promise<IMatch> {
    // check if any of the players have unfinished games
    const unfinishedMatch = await Match.findOne({
      $or: [
        // $in = OR | $all = AND
        { team1Players: { $all: team1Players }, isFinished: false },
        { team2Players: { $all: team1Players }, isFinished: false },
        { team1Players: { $all: team2Players }, isFinished: false },
        { team2Players: { $all: team2Players }, isFinished: false },
      ],
    }).lean();

    if (unfinishedMatch) {
      throw new Error(
        `Não foi possível criar a partida pois um participante possui uma disputa em aberto, compute os pontos antes de criar ou participar de uma nova`,
      );
    }

    const newMatch = new Match({
      matchType,
      numberOfMatches,
      hostPlayerId,
      team1Players,
      team2Players,
    });

    const newMatchReponse = await newMatch.save();
    return newMatchReponse;
  }
}
