import Discord from 'discord.js';

import UpdateMatchScoreService from '@services/matchmaking/score/UpdateMatchScoreService';
import FindMatchService from '@services/matchmaking/match/FindMatchService';
import { IDiscordCommand } from '../../types';

const scoreCommand: IDiscordCommand = {
  name: 'score',
  description: 'Registra os pontos de uma partida criada',
  aliases: ['pontos'],
  cooldown: 5,
  guildOnly: true,
  isArgumentsRequired: true,
  usage:
    '<número de jogos ganhos pelo desafiante> <número de jogos ganhos pelo oponente>',
  async execute(message, args) {
    const { client } = message;

    if (!args?.length || args?.length !== 2) {
      message.reply('Informe a quantidade de jogos ganhos por cada jogador');
      return;
    }

    const player1Wins = Number(args[0]);
    const player2Wins = Number(args[1]);

    // check if author have a valid match to compute points
    try {
      const findMatchService = new FindMatchService();
      const unfinishedMatch = await findMatchService.execute({
        $or: [
          { player1Id: message.author.id, isFinished: false },
          { player2Id: message.author.id, isFinished: false },
        ],
      });

      if (!unfinishedMatch) {
        message.reply(
          `Você não está participando de nenhuma partida para computar pontos`,
        );
        return;
      }

      if (unfinishedMatch.games !== player1Wins + player2Wins) {
        message.reply(
          `A quantidade de vitórias não corresponde ao total de jogos registrados na partida (${unfinishedMatch.games})`,
        );
        return;
      }

      const approvalUserId =
        message.author.id === unfinishedMatch.player1Id
          ? unfinishedMatch.player2Id
          : unfinishedMatch.player1Id;

      const scoreCreateMessage = await message.channel.send(
        `<@${approvalUserId}> o usuário ${message.author.username} está querendo registrar a seguinte pontuação para a partida \`${unfinishedMatch._id}\`:\n<@${unfinishedMatch.player1Id}> = ${player1Wins} vitória(s) | <@${unfinishedMatch.player2Id}> = ${player2Wins} vitória(s), para aceitar utilize reaction 👍 em até 10 minutos`,
      );

      scoreCreateMessage.react('👍');

      const filter: Discord.CollectorFilter = (
        reaction,
        user: Discord.ClientUser,
      ) => {
        return (
          !user.bot &&
          user.id === approvalUserId &&
          ['👍'].includes(reaction.emoji.name)
        );
      };

      try {
        const collectedReaction = await scoreCreateMessage.awaitReactions(
          filter,
          {
            max: 1,
            maxEmojis: 1,
            maxUsers: 1,
            time: 10 * 60 * 1000,
            errors: ['time'],
          },
        );

        const firstReaction = collectedReaction.first();

        if (firstReaction?.emoji.name === '👍') {
          const opponent = firstReaction.users.cache
            .filter(user => !user.bot)
            .array();

          if (opponent.length) {
            const { username: player1Username } = await client.users.fetch(
              unfinishedMatch.player1Id,
            );
            const { username: player2Username } = await client.users.fetch(
              unfinishedMatch.player2Id,
            );

            // update score
            const updateMatchScoreService = new UpdateMatchScoreService();

            const updatedUnfinishedMatch = {
              ...unfinishedMatch,
              player1Score: player1Wins,
              player2Score: player2Wins,
              isFinished: true,
              player1Username,
              player2Username,
            };

            const updatedMatchScore = await updateMatchScoreService.execute(
              updatedUnfinishedMatch,
            );

            message.reply(
              `Partida \`${unfinishedMatch._id}\` finalizada e pontos computados`,
            );
          }
        }
      } catch (error) {
        console.log(error);

        message.reply(
          'O oponente não concordou em registrar essa pontuação ou ocorreu algum erro ao tentar registrar, tente novamente.',
        );
      }
    } catch (error) {
      console.log(error);
    }
  },
};

export default scoreCommand;
