import { MessageEmbed } from 'discord.js';

import { IDiscordCommand } from '@discord/types';
import { matchTypeList, matchTypeConcat } from '@config/matchmaking';
import FindRankingService from '@services/matchmaking/score/FindRankingService';

const command: IDiscordCommand = {
  name: 'top10',
  description: 'Lista os 10 jogadores com maior pontuação na categoria',
  cooldown: 10,
  guildOnly: false,
  isArgumentsRequired: true,
  usage: `<categoria da partida>\n\`${matchTypeConcat}\``,
  async execute(message, args) {
    const { client } = message;

    if (!args?.length || !matchTypeList.includes(args[0])) {
      message.reply(
        `Categoria de ranking inválida, categorias disponíveis:\n${matchTypeConcat}`,
      );
      return;
    }

    const matchType = args[0];

    try {
      const findRankingService = new FindRankingService();
      const ranking = await findRankingService.execute(
        {
          matchType,
        },
        10,
      );

      if (!ranking?.length) {
        message.reply(
          `Essa categoria ainda não possui nenhum jogador com pontos`,
        );
        return;
      }

      const rankingList = ranking
        .map((player, idx) => {
          return `${idx + 1} - ${player.playerUsername} - Elo: ${
            player.eloRating
          } - ${player.eloName} | G: ${player.gamesPlayed} | W: ${
            player.wins
          } | L: ${player.losses}`;
        })
        .join('\n');

      const rankingMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Ranking ${matchType}`)
        .setDescription('Top 10 player da categoria')
        .addFields({ name: 'Rank', value: rankingList })
        .setTimestamp();

      message.channel.send(rankingMessage);
    } catch (error) {
      client.logger?.log('error', 'Erro no comando top10', error);
    }
  },
};

export default command;
