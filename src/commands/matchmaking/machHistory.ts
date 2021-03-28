import { MessageEmbed } from 'discord.js';
import ptBR, { format } from 'date-fns';

import FindHistoryMatchService from '@services/matchmaking/match/FindHistoryMatchService';
import { matchTypeList, matchTypeConcat } from '@config/match';
import { IDiscordCommand } from '../../types';

const DATE_FORMAT = 'dd/MM/yyyy H:m';

const command: IDiscordCommand = {
  name: 'match-history',
  description: 'Lista as 10 últimas partidas do jogador em uma categoria',
  aliases: ['historico'],
  cooldown: 10,
  guildOnly: false,
  isArgumentsRequired: true,
  usage: `<categoria da partida>\n\`${matchTypeList}\``,
  async execute(message, args) {
    const { client } = message;

    if (!args?.length || !matchTypeList.includes(args[0])) {
      message.reply(
        `Categoria das partidas inválida, categorias disponíveis:\n${matchTypeConcat}`,
      );
      return;
    }

    const matchType = args[0];

    try {
      const findHistoryMatchService = new FindHistoryMatchService();
      const matchHistory = await findHistoryMatchService.execute(
        {
          playerId: message.author.id,
          matchType,
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
          const team1Mention = match.team1Players
            .map(playerId => `<@${playerId}>`)
            .join(', ');

          const team2Mention = match.team2Players
            .map(playerId => `<@${playerId}>`)
            .join(', ');

          return `${idx + 1} - ${format(match.updatedAt, DATE_FORMAT, {
            locale: ptBR,
          })} - ${team1Mention} (W: ${
            match.team1Wins
          }) vs ${team2Mention} (W: ${match.team2Wins})`;
        })
        .join('\n');

      const matchHistoryMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Histórico`)
        .setDescription(`Últimas 10 partidas da categoria ${matchType}`)
        .addFields({ name: 'Partidas', value: matchList });

      message.channel.send(matchHistoryMessage);
    } catch (error) {
      client.logger?.log('error', 'Erro no comando history', error);
    }
  },
};

export default command;
