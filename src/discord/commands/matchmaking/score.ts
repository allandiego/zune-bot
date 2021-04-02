import Discord from 'discord.js';

import { IDiscordCommand } from '@discord/types';
import { moderatorRoleName } from '@config/matchmaking';
import UpdateMatchScoreService from '@services/matchmaking/score/UpdateMatchScoreService';
import FindUnfinishedMatchService from '@services/matchmaking/match/FindUnfinishedMatchService';

const MAX_AWAIT_REACTION_TIME = 10 * 60 * 1000;

const command: IDiscordCommand = {
  name: 'score',
  description: 'Registra os pontos de uma partida criada',
  aliases: ['pontos'],
  cooldown: 5,
  guildOnly: true,
  isArgumentsRequired: true,
  usage: `<Sequência de vitórias e derrotas: W para vitória L para derrota>\n exemplo de 5 partidas: WLLWW`,
  async execute(message, args) {
    const { client } = message;

    if (!args?.length) {
      // message.reply('Informe a sequência  de vitórias e derrotas');
      return;
    }

    const authorScoreOrder: string = args[0]
      .toUpperCase()
      .replace(/[^W|L]/gm, '');
    const authorResultList = [...authorScoreOrder];
    const authorWins = authorResultList.reduce((acc, item) => {
      return acc + (item === 'W' ? 1 : 0);
    }, 0);

    const opponentScoreOrder = authorResultList
      .map(item => (item === 'W' ? 'L' : 'W'))
      .join('');
    const opponentResultList = [...opponentScoreOrder];
    const opponentWins = opponentResultList.reduce((acc, item) => {
      return acc + (item === 'W' ? 1 : 0);
    }, 0);

    // check if author have a valid match to compute points
    try {
      const findUnfinishedMatchService = new FindUnfinishedMatchService();
      const unfinishedMatch = await findUnfinishedMatchService.execute({
        playerId: message.author.id,
      });

      if (!unfinishedMatch) {
        message.reply(
          `Você não está participando de nenhuma partida para computar pontos`,
        );
        return;
      }

      if (unfinishedMatch.numberOfMatches !== authorResultList.length) {
        message.reply(
          `A quantidade reportada não corresponde ao total de partidas registrados na disputa (${unfinishedMatch.numberOfMatches})`,
        );
        return;
      }

      const authorTeamNumber = unfinishedMatch.team1Players.find(
        playerId => playerId === message.author.id,
      )
        ? 1
        : 2;

      const team1PlayersMention = unfinishedMatch.team1Players
        .map(playerId => `<@${playerId}>`)
        .join(' ');

      const team2PlayersMention = unfinishedMatch.team2Players
        .map(playerId => `<@${playerId}>`)
        .join(' ');

      const approvalTeamPlayers =
        authorTeamNumber === 1
          ? unfinishedMatch.team2Players
          : unfinishedMatch.team1Players;

      const approvalTeamMention =
        authorTeamNumber === 1 ? team2PlayersMention : team1PlayersMention;

      const scoreCreateMessage = await message.channel.send(
        `${approvalTeamMention} o usuário ${
          message.author.username
        } está querendo registrar a seguinte pontuação para a disputa ${
          unfinishedMatch.matchType
        } \`${unfinishedMatch._id}\`:\nTime1 - (${
          authorTeamNumber === 1 ? authorScoreOrder : opponentScoreOrder
        }):\n ${team1PlayersMention}\nTime2 - (${
          authorTeamNumber === 2 ? authorScoreOrder : opponentScoreOrder
        }):\n ${team2PlayersMention}\nUtilize reaction 👍 em até ${
          MAX_AWAIT_REACTION_TIME / 60000
        } minuto(s) para aceitar`,
        { split: true },
      );

      const scoreCreateMessageReact =
        scoreCreateMessage[scoreCreateMessage.length - 1];

      await scoreCreateMessageReact.react('👍');

      const reactionFilter: Discord.CollectorFilter = async (
        reaction,
        user: Discord.ClientUser,
      ) => {
        const isMod =
          message.guild?.members.cache
            .find(member => member.id === user.id)
            ?.roles.cache.some(role =>
              [moderatorRoleName].includes(role.name),
            ) ?? false;

        return (
          !user.bot &&
          (approvalTeamPlayers.includes(user.id) || isMod) &&
          ['👍'].includes(reaction.emoji.name)
        );
      };

      try {
        const collectedReaction = await scoreCreateMessageReact.awaitReactions(
          reactionFilter,
          {
            max: 1,
            maxEmojis: 1,
            maxUsers: 1,
            time: MAX_AWAIT_REACTION_TIME,
            errors: ['time'],
          },
        );

        const firstReaction = collectedReaction.first();

        if (firstReaction?.emoji.name === '👍') {
          // const player1Dicord = await client.users.fetch(
          //   unfinishedMatch.player1Id,
          // );
          const team1 = unfinishedMatch.team1Players.map(playerId => {
            const user = message?.guild?.members.cache.find(
              member => member.user.id === playerId,
            );

            return { playerId, playerUsername: user?.user.username ?? '' };
          });

          const team2 = unfinishedMatch.team2Players.map(playerId => {
            const user = message?.guild?.members.cache.find(
              member => member.user.id === playerId,
            );

            return { playerId, playerUsername: user?.user.username ?? '' };
          });

          // update score
          const updateMatchScoreService = new UpdateMatchScoreService();

          const finishedMatch: typeof unfinishedMatch = {
            ...unfinishedMatch,
            scoreReportPlayerId: message.author.id,
            team1ScoreOrder:
              authorTeamNumber === 1 ? authorScoreOrder : opponentScoreOrder,
            team2ScoreOrder:
              authorTeamNumber === 2 ? authorScoreOrder : opponentScoreOrder,
            team1Wins: authorTeamNumber === 1 ? authorWins : opponentWins,
            team2Wins: authorTeamNumber === 2 ? authorWins : opponentWins,
            isFinished: true,
          };

          const updateMatchScoreData = {
            finishedMatch,
            team1Data: {
              players: team1,
              scoreOrder:
                authorTeamNumber === 1 ? authorResultList : opponentResultList,
            },
            team2Data: {
              players: team2,
              scoreOrder:
                authorTeamNumber === 2 ? authorResultList : opponentResultList,
            },
          };

          const {
            team1NewEloName,
            team2NewEloName,
          } = await updateMatchScoreService.execute(updateMatchScoreData);

          // remove old rank roles

          try {
            // set new rank role
            if (team1NewEloName && team2NewEloName) {
              const team1EloRole = message?.guild?.roles.cache.find(
                role => role.name === team1NewEloName,
              );

              const team2EloRole = message?.guild?.roles.cache.find(
                role => role.name === team2NewEloName,
              );

              if (team1EloRole) {
                await Promise.all(
                  team1.map(async player => {
                    await message.guild?.members.cache
                      .find(member => member.id === player.playerId)
                      ?.roles.add(team1EloRole);
                  }),
                );
              }

              if (team2EloRole) {
                await Promise.all(
                  team2.map(async player => {
                    await message.guild?.members.cache
                      .find(member => member.id === player.playerId)
                      ?.roles.add(team2EloRole);
                  }),
                );
              }
            }
          } catch (error) {
            console.log(error);
            message.reply(
              'Erro: Os pontos da partida foram salvos porém não foi possível mudar o cargo do rank para os jogadores',
            );
            return;
          }

          message.reply(
            `Partida \`${unfinishedMatch._id}\` finalizada e pontos computados`,
          );
        }
      } catch (error) {
        console.log(error);

        message.reply(
          'O oponente não concordou em registrar essa pontuação ou ocorreu algum erro ao tentar registrar, tente novamente.',
        );
      }
    } catch (error) {
      console.log(error);
      client.logger?.log('error', 'Erro no comando score', error);
    }
  },
};

export default command;
