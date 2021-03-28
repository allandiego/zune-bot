import { Score } from '@database/schemas';
import { IMatch } from '@model/matchmaking/MatchModel';
import UpdateMatchService from '@services/matchmaking/match/UpdateMatchService';
import { Elo } from '../../../util';

interface ITeam {
  playerId: string;
  playerUsername: string;
}

interface ITeamData {
  players: ITeam[];
  scoreOrder: string[];
}

interface IRequest {
  finishedMatch: IMatch;
  team1Data: ITeamData;
  team2Data: ITeamData;
}

interface UpdatedMatchScoreData {
  team1NewEloName: string;
  team2NewEloName: string;
}

interface ICalculatedElo {
  team1NewEloRating: number;
  team2NewEloRating: number;
}
const INITIAL_ELO_RATING = 600;

export default class UpdateMatchScoreService {
  public async execute({
    finishedMatch,
    team1Data,
    team2Data,
  }: IRequest): Promise<UpdatedMatchScoreData> {
    function eloRatingToEloName(eloRating: number): string {
      if (eloRating >= 2400) {
        return 'Master';
      }
      if (eloRating >= 2000 && eloRating <= 2399) {
        return 'Diamond';
      }
      if (eloRating >= 1400 && eloRating <= 1999) {
        return 'Gold';
      }
      if (eloRating >= 800 && eloRating <= 1399) {
        return 'Silver';
      }

      return 'Bronze';
    }

    // eslint-disable-next-line consistent-return
    function calculateEloRating(
      team1EloRating: number,
      team2EloRating: number,
      team1GameSequence: string[],
    ): ICalculatedElo {
      // menos 2100 => K-factor 32
      // entre 2100 e 2400 => K-factor 24
      // acima 2400 => K-factor 16
      const kFactorRating = {
        default: 32,
        '2100': 24,
        '2400': 16,
      };

      const minScore = 100;
      const maxScore = 10000;

      const team1GameResult = team1GameSequence[0] === 'W' ? 1 : 0;
      const team2GameResult = team1GameSequence[0] === 'W' ? 0 : 1;

      const elo = new Elo(kFactorRating, minScore, maxScore);

      const team1ExpectedScore = elo.expectedScore(
        team1EloRating,
        team2EloRating,
      );
      const team2ExpectedScore = elo.expectedScore(
        team2EloRating,
        team1EloRating,
      );

      const team1NewEloRating = elo.newRating(
        team1ExpectedScore,
        team1GameResult,
        team1EloRating,
      );
      const team2NewEloRating = elo.newRating(
        team2ExpectedScore,
        team2GameResult,
        team2EloRating,
      );

      const newGameSequence = [...team1GameSequence];
      newGameSequence.shift();

      // no more games to compute return
      if (newGameSequence.length === 0) {
        const newElos = {
          team1NewEloRating: team1EloRating,
          team2NewEloRating: team2EloRating,
        };
        return newElos;
      }

      return calculateEloRating(
        team1NewEloRating,
        team2NewEloRating,
        newGameSequence,
      );
    }

    // check if exists
    const team1ExistingScores = await Score.find({
      playerId: { $in: finishedMatch.team1Players },
      matchType: finishedMatch.matchType,
    });

    const team2ExistingScores = await Score.find({
      playerId: { $in: finishedMatch.team2Players },
      matchType: finishedMatch.matchType,
    });

    // console.log('team1ExistingScores', Array.from(team1ExistingScores));
    // console.log('team2ExistingScores', Array.from(team2ExistingScores));

    const team1WithScores = team1Data.players.map(player => {
      return {
        ...player,
        existingScore: team1ExistingScores.find(
          score => score.playerId === player.playerId,
        ),
      };
    });

    const team2WithScores = team2Data.players.map(player => {
      return {
        ...player,
        existingScore: team2ExistingScores.find(
          score => score.playerId === player.playerId,
        ),
      };
    });

    // console.log('team1WithScores', team1WithScores);
    // console.log('team2WithScores', team2WithScores);

    const numberOfTeamPlayers = finishedMatch.team1Players.length;

    const team1SumElo = team1ExistingScores.reduce((acc, score) => {
      return acc + score.eloRating;
    }, 0);

    const team2SumElo = team2ExistingScores.reduce((acc, score) => {
      return acc + score.eloRating;
    }, 0);

    const team1AverageElo =
      (team1SumElo +
        (numberOfTeamPlayers - team1ExistingScores.length) *
          INITIAL_ELO_RATING) /
      numberOfTeamPlayers;

    const team2AverageElo =
      (team2SumElo +
        (numberOfTeamPlayers - team2ExistingScores.length) *
          INITIAL_ELO_RATING) /
      numberOfTeamPlayers;

    // console.log('team1AverageElo', team1AverageElo);
    // console.log('teateam2AverageElom2Elo', team2AverageElo);

    const { team1NewEloRating, team2NewEloRating } = calculateEloRating(
      team1AverageElo,
      team2AverageElo,
      team1Data.scoreOrder,
    );
    const team1NewEloName = eloRatingToEloName(team1NewEloRating);
    const team2NewEloName = eloRatingToEloName(team2NewEloRating);

    // console.log('team1NewEloRating', team1NewEloRating, team1NewEloName);
    // console.log('team2NewEloRating', team2NewEloRating, team2NewEloName);

    const scoreSession = await Score.startSession();

    await scoreSession.withTransaction(async () => {
      await Promise.all(
        team1WithScores.map(async player => {
          // if no existing score create
          if (!player.existingScore) {
            const newPlayerScore = new Score({
              matchType: finishedMatch.matchType,
              playerId: player.playerId,
              playerUsername: player.playerUsername,
              wins: finishedMatch.team1Wins,
              losses: finishedMatch.team2Wins,
              gamesPlayed: finishedMatch.numberOfMatches,
              eloRating: team1NewEloRating,
              eloName: team1NewEloName,
            });

            const createdPlayerScore = await newPlayerScore.save({
              session: scoreSession,
            });
          } else {
            const { existingScore } = player;
            // update exiting score
            existingScore.playerUsername = player.playerUsername;
            existingScore.wins += finishedMatch.team1Wins;
            existingScore.losses += finishedMatch.team2Wins;
            existingScore.gamesPlayed += finishedMatch.numberOfMatches;
            existingScore.eloRating = team1NewEloRating;
            existingScore.eloName = team1NewEloName;

            const updatedPlayerScore = await existingScore.save({
              session: scoreSession,
            });
          }
        }),
      );

      await Promise.all(
        team2WithScores.map(async player => {
          // if no existing score create
          if (!player.existingScore) {
            const newPlayerScore = new Score({
              matchType: finishedMatch.matchType,
              playerId: player.playerId,
              playerUsername: player.playerUsername,
              wins: finishedMatch.team2Wins,
              losses: finishedMatch.team1Wins,
              gamesPlayed: finishedMatch.numberOfMatches,
              eloRating: team2NewEloRating,
              eloName: team2NewEloName,
            });

            const createdPlayerScore = await newPlayerScore.save({
              session: scoreSession,
            });
          } else {
            const { existingScore } = player;
            // update exiting score
            existingScore.playerUsername = player.playerUsername;
            existingScore.wins += finishedMatch.team2Wins;
            existingScore.losses += finishedMatch.team1Wins;
            existingScore.gamesPlayed += finishedMatch.numberOfMatches;
            existingScore.eloRating = team2NewEloRating;
            existingScore.eloName = team2NewEloName;

            const updatedPlayerScore = await existingScore.save({
              session: scoreSession,
            });
          }
        }),
      );

      // update match to finished
      const updateMatchService = new UpdateMatchService();
      await updateMatchService.execute(finishedMatch);
      // } catch (error) {
      //   await scoreSession.abortTransaction();
      // }
    });

    scoreSession.endSession();

    const updatedMatchScoreData: UpdatedMatchScoreData = {
      team1NewEloName,
      team2NewEloName,
    };

    return updatedMatchScoreData;
  }
}
