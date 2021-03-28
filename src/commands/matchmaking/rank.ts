import path from 'path';
import fs from 'fs';
import { MessageEmbed } from 'discord.js';

import FindRankingService from '@services/matchmaking/score/FindRankingService';
import { matchTypeList, matchTypeConcat } from '@config/match';
import { appendDataToFile } from '../../util/File';
import { IDiscordCommand } from '../../types';

const command: IDiscordCommand = {
  name: 'rank',
  description: 'Retorna a lista do ranking da categoria informada',
  aliases: ['ranking', 'leaderboard'],
  cooldown: 10,
  guildOnly: false,
  isArgumentsRequired: true,
  usage: `<categoria>\n${matchTypeConcat}`,
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
        5000,
      );

      if (!ranking?.length) {
        message.reply(
          `Essa categoria ainda não possui nenhum jogador com pontos`,
        );
        return;
      }

      const outputFile = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        `lista-rank-${matchType}-${new Date().getTime()}.txt`,
      );

      const headerData = [
        { text: 'RANKING', padding: 10 },
        { text: 'DISCORD ID', padding: 25 },
        { text: 'DISCORD USERNAME', padding: 30 },
        { text: 'ELO RATING', padding: 15 },
        { text: 'ELO NAME', padding: 15 },
        { text: 'JOGOS', padding: 15 },
        { text: 'VITÓRIAS', padding: 15 },
        { text: 'DERROTAS', padding: 15 },
      ];

      const header = headerData
        .map(item => item.text.padEnd(item.padding))
        .join('|');

      await appendDataToFile(outputFile, `${header}\n`);

      // eslint-disable-next-line no-restricted-syntax
      for (const [idx, player] of ranking.entries()) {
        const line = `${String(idx + 1).padEnd(10)}|${player.playerId.padEnd(
          25,
        )}|${player.playerUsername.padEnd(30)}|${String(
          player.eloRating,
        ).padEnd(15)}|${String(player.eloName).padEnd(15)}|${String(
          player.gamesPlayed,
        ).padEnd(15)}|${String(player.wins).padEnd(15)}|${String(
          player.losses,
        ).padEnd(15)}\n`;

        // eslint-disable-next-line no-await-in-loop
        await appendDataToFile(outputFile, line);
      }

      const rankingMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Ranking ${matchType}`)
        .addFields({
          name: 'Rank',
          value: `
        2400 - 10000 => Master
        2000 - 2399  => Diamond
        1400 - 1999  => Gold
        800  - 1399  => Silver
        100  - 799   => Bronze`,
        })
        .setTimestamp();

      await message.channel.send({
        embed: rankingMessage,
        files: [
          {
            attachment: outputFile,
            name: `lista-rank-${matchType}.txt`,
          },
        ],
      });

      fs.unlinkSync(outputFile);
    } catch (error) {
      client.logger?.log('error', 'Erro no comando ranking', error);
    }
  },
};

export default command;
