import { MessageEmbed } from 'discord.js';

import FindRankingService from '@services/matchmaking/score/FindRankingService';
import { IDiscordCommand } from '../../types';

const GAME_CATEGORIES = `switch-singles, switch-doubles, yuzu-singles, yuzu-doubles`;

const rankCommand: IDiscordCommand = {
  name: 'top10',
  description: 'Lista os 10 jogadores com maior pontuação na categoria',
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
      const findRankingService = new FindRankingService();
      const ranking = await findRankingService.execute(
        {
          type: matchCategory,
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
          return `${idx + 1} - <@${player.playerId}> - Elo: ${
            player.eloRating
          } | Jogos (${player.wins + player.losses}) => V: ${
            player.wins
          } - D: ${player.losses}`;
        })
        .join('\n');

      const rankingMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Ranking ${matchCategory}`)
        .setDescription('Top 10 player da categoria')
        .addFields({ name: 'Rank', value: rankingList })
        .setTimestamp();

      message.channel.send(rankingMessage);
    } catch (error) {
      console.log(error);
    }
  },
};

export default rankCommand;
