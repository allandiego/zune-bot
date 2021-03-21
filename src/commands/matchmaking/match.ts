import Discord from 'discord.js';

import CreateMatchService from '@services/matchmaking/match/CreateMatchService';
import FindMatchService from '@services/matchmaking/match/FindMatchService';
import { IDiscordCommand } from '../../types';

const GAME_CATEGORIES = `\`switch-singles, switch-doubles, yuzu-singles, yuzu-doubles\``;

const command: IDiscordCommand = {
  name: 'match',
  description: 'Cria uma disputa com um número definido de partidas',
  aliases: ['jogo', 'partida'],
  cooldown: 5,
  guildOnly: true,
  isArgumentsRequired: true,
  usage: `<número de partidas> <categoria da partida>\n${GAME_CATEGORIES}`,
  async execute(message, args) {
    const { client } = message;

    if (!args?.length || args?.length !== 2) {
      message.reply(
        `Informe o número de partidas e a categoria ${GAME_CATEGORIES}`,
      );
      return;
    }

    if (
      ![
        'switch-singles',
        'switch-doubles',
        'yuzu-singles',
        'yuzu-doubles',
      ].includes(args[1])
    ) {
      message.reply(`Categoria inválida, valores aceitos: ${GAME_CATEGORIES}`);
      return;
    }

    const numberOfGames = Number(args[0]);
    const matchCategory = args[1];

    if (Number.isNaN(numberOfGames) || numberOfGames === 0) {
      message.reply('A quantidade de jogos está inválida.');
      return;
    }

    if (numberOfGames % 2 === 0) {
      message.reply(`Só é possível criar partidas com número ímpar de jogos`);
      return;
    }

    // check for unfinished games
    try {
      const findMatchService = new FindMatchService();
      const unfinishedMatch = await findMatchService.execute({
        $or: [
          { player1Id: message.author.id, isFinished: false },
          { player2Id: message.author.id, isFinished: false },
        ],
      });

      if (unfinishedMatch) {
        message.reply(
          `Você está na partida \`${unfinishedMatch._id}\`, por favor compute os pontos antes de criar uma nova partida`,
        );
        return;
      }
    } catch (error) {
      console.log(error);
    }

    // custom emoji
    // const reactionEmoji = message?.guild?.emojis.cache.find(
    //   emoji => emoji.name === 'ayy',
    // );
    // if (reactionEmoji) {
    //   message.react(reactionEmoji);
    // }
    // message.react('👍');

    const mentionRoleName = matchCategory.startsWith('switch')
      ? 'UltimateRanked'
      : 'YuzuRanked';

    // get role by name
    const mentionRole = message?.guild?.roles.cache.find(
      role => role.name === mentionRoleName,
    );

    const mentionTo = mentionRole ? `<@&${mentionRole?.id}>` : '';

    const matchCreateMessage = await message.channel.send(
      `${mentionTo} ${message.author.username} está procurando uma disputa para \`${matchCategory}\` de ${numberOfGames} partidas, utilize reaction 👍 em até 10 minuto para aceitar`,
    );
    matchCreateMessage.react('👍');

    const filter: Discord.CollectorFilter = (
      reaction,
      user: Discord.ClientUser,
    ) => {
      return (
        !user.bot &&
        // user.id !== message.author.id &&
        ['👍'].includes(reaction.emoji.name)
      );
    };

    try {
      const collectedReaction = await matchCreateMessage.awaitReactions(
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
          const player1 = {
            id: message.author.id,
            username: message.author.username,
          };

          const player2 = {
            id: opponent[0].id,
            username: opponent[0].username,
          };

          const createMatchService = new CreateMatchService();

          const createdMatch = await createMatchService.execute({
            type: 'switch-singles',
            player1Id: player1.id,
            player2Id: player2.id,
            games: numberOfGames,
          });

          message.reply(
            `Partida \`${createdMatch._id}\` criada entre: <@${player1.id}> vs <@${player2.id}>, ao terminar compute os pontos usando o comando pontos`,
          );
        }
      }
    } catch (error) {
      console.log(error);
      message.reply(
        'Ninguém aceitou participar do desafio, partida cancelada.',
      );
    }
  },
};

export default command;
