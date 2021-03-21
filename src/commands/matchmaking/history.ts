import { MessageEmbed } from 'discord.js';
import ptBR, { format } from 'date-fns';

import FindHistoryMatchService from '@services/matchmaking/match/FindHistoryMatchService';
import { IDiscordCommand } from '../../types';

const DATE_FORMAT = 'dd/MM/yyyy H:m';
const GAME_CATEGORIES = `switch-singles, switch-doubles, yuzu-singles, yuzu-doubles`;

const rankCommand: IDiscordCommand = {
  name: 'history',
  description: 'Lista as 10 últimas partidas do jogador em uma categoria',
  aliases: ['historico'],
  cooldown: 10,
  guildOnly: false,
  isArgumentsRequired: true,
  usage: `<categoria da partida>\n${GAME_CATEGORIES}`,
  async execute(message, args) {
    if (
      !args?.length ||
      ![
        'switch-singles',
        'switch-doubles',
        'yuzu-singles',
        'yuzu-doubles',
      ].includes(args[0])
    ) {
      message.reply(`Categoria de ranking inválida:\n${GAME_CATEGORIES}`);
      return;
    }

    const matchCategory = args[0];

    try {
      const findHistoryMatchService = new FindHistoryMatchService();
      const matchHistory = await findHistoryMatchService.execute(
        {
          type: matchCategory,
          isFinished: true,
          $or: [
            { player1Id: message.author.id, isFinished: true },
            { player2Id: message.author.id, isFinished: true },
          ],
        },
        10,
      );

      if (!matchHistory?.length) {
        message.reply(
          `Você não possui nenhum histórico de partidas para essa categoria`,
        );
        return;
      }

      const matchList = matchHistory
        .map((match, idx) => {
          return `${idx + 1} - ${format(match.updatedAt, DATE_FORMAT, {
            locale: ptBR,
          })} > <@${match.player1Id}> V: ${match.player1Score} vs <@${
            match.player2Id
          }> V: ${match.player2Score}`;

          // return `${idx + 1} - ${format(match.updatedAt, DATE_FORMAT, {
          //   locale: ptBR,
          // })} - ${match._id} (${match.games}) => <@${match.player1Id}> V: ${
          //   match.player1Score
          // } | D: ${match.player2Score} vs <@${match.player2Id}> V: ${
          //   match.player2Score
          // } | D: ${match.player1Score}`;
        })
        .join('\n');

      const matchHistoryMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Histórico`)
        .setDescription(`Últimas 10 partidas da categoria ${matchCategory}`)
        .addFields({ name: 'Partidas', value: matchList })
        .setTimestamp();

      message.channel.send(matchHistoryMessage);
    } catch (error) {
      console.log(error);
    }
  },
};

export default rankCommand;
