import UpdateMatchService from '@services/matchmaking/match/UpdateMatchService';
import { Score } from '@database/schemas';
import { IMatch } from '../match/types';
import { Elo } from '../../../util';

interface IRequest extends IMatch {
  player1Username: string;
  player2Username: string;
}

const INITIAL_ELO_RATING = 600;

export default class UpdateMatchScoreService {
  public async execute(unfinishedMatch: IRequest): Promise<void> {
    function calculateEloRating(
      player1Elo: number,
      player1MatchWins: number,
      player2Elo: number,
      player2MatchWins: number,
    ) {
      // 2400-10000 => Master
      // 2000-2399  => Diamond
      // 1400-1999  => Gold
      // 800-1399  => Silver
      // 100-799    => Bronze

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

      const elo = new Elo(kFactorRating, minScore, maxScore);
      const oddsWins = elo.expectedScore(player1Elo, player2Elo);
      const newEloRating = elo.newRating(oddsWins, 1, player1Elo);
      console.log('The odds of winning are about:', oddsWins);
      console.log('player1 new rating after won:', player1Elo);

      const player1NewEloRating = 0;
      const player2NewEloRating = 0;
      return { player1NewEloRating, player2NewEloRating };
    }

    // check if exists
    const player1ExistingScore = await Score.findOne({
      playerId: unfinishedMatch.player1Id,
      type: unfinishedMatch.type,
    });

    const player2ExistingScore = await Score.findOne({
      playerId: unfinishedMatch.player2Id,
      type: unfinishedMatch.type,
    });

    // // player 1 elo
    // for (let game = 1; game <= unfinishedMatch.player1Score; game += 1) {

    // }

    // // player 2 elo
    // for (let game = 1; game <= unfinishedMatch.player2Score; game += 1) {

    // }

    // const { player1NewEloRating, player2NewEloRating } = calculateEloRating();
    const player1NewEloRating = 300;
    const player2NewEloRating = 300;

    const scoreSession = await Score.startSession();

    await scoreSession.withTransaction(async () => {
      // try {
      // update player1 score
      if (!player1ExistingScore) {
        // console.log('create score player1');

        const newPlayer1Score = new Score({
          type: unfinishedMatch.type,
          playerId: unfinishedMatch.player1Id,
          playerUsername: unfinishedMatch.player1Username,
          wins: unfinishedMatch.player1Score,
          losses: unfinishedMatch.player2Score,
          gamesPlayed: unfinishedMatch.games,
          eloRating: player1NewEloRating,
        });

        const createdPlayer1Score = await newPlayer1Score.save({
          session: scoreSession,
        });
      } else {
        // console.log('update score player1');

        player1ExistingScore.playerUsername = unfinishedMatch.player1Username;
        player1ExistingScore.wins += unfinishedMatch.player1Score;
        player1ExistingScore.losses += unfinishedMatch.player2Score;
        player1ExistingScore.gamesPlayed += unfinishedMatch.games;
        player1ExistingScore.eloRating = player1NewEloRating;

        const updatedPlayer1Score = await player1ExistingScore.save({
          session: scoreSession,
        });
      }

      // update player2 score
      if (!player2ExistingScore) {
        // console.log('create score player2');

        const newPlayer2Score = new Score({
          type: unfinishedMatch.type,
          playerId: unfinishedMatch.player2Id,
          playerUsername: unfinishedMatch.player2Username,
          wins: unfinishedMatch.player2Score,
          losses: unfinishedMatch.player1Score,
          gamesPlayed: unfinishedMatch.games,
          eloRating: player2NewEloRating,
        });

        const createdPlayer2Score = await newPlayer2Score.save({
          session: scoreSession,
        });
      } else {
        // console.log('update score player2');
        player2ExistingScore.playerUsername = unfinishedMatch.player2Username;
        player2ExistingScore.wins += unfinishedMatch.player2Score;
        player2ExistingScore.losses += unfinishedMatch.player1Score;
        player2ExistingScore.gamesPlayed += unfinishedMatch.games;
        player2ExistingScore.eloRating = player2NewEloRating;

        const updatedPlayer2Score = await player2ExistingScore.save({
          session: scoreSession,
        });
      }

      // update match to finished
      const updateMatchService = new UpdateMatchService();
      const updatedMatch = await updateMatchService.execute(unfinishedMatch);
      // } catch (error) {
      //   await scoreSession.abortTransaction();
      // }
    });

    scoreSession.endSession();
  }
}
