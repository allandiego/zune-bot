import Discord, { MessageEmbed } from 'discord.js';

import { IDiscordCommand } from '@discord/types';
import {
  matchesSettings,
  matchTypeList,
  matchTypeConcat,
  matchMaxAwaitingTime,
} from '@config/matchmaking';
import CreateMatchService from '@services/matchmaking/match/CreateMatchService';
import FindUnfinishedMatchService from '@services/matchmaking/match/FindUnfinishedMatchService';

const MAX_NUMBER_OF_MATCHES = 20;

function knuthShuffleArray(array: any[]) {
  const shuffledArray = [...array];
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = shuffledArray[currentIndex];
    shuffledArray[currentIndex] = shuffledArray[randomIndex];
    shuffledArray[randomIndex] = temporaryValue;
  }

  return shuffledArray;
}

function splitArrayByHalf(array: any[]) {
  const half = Math.ceil(array.length / 2);

  const firstHalf = array.splice(0, half);
  const secondHalf = array.splice(-half);
  return { firstHalf, secondHalf };
}

const command: IDiscordCommand = {
  name: 'match',
  description: 'Cria uma disputa entre 2 times',
  aliases: ['jogo', 'jogar', 'partida'],
  cooldown: 5,
  guildOnly: true,
  isArgumentsRequired: true,
  usage: `<número de partidas> <categoria da partida> <número de jogadores [opcional, quando não informado será considerado 2]>\ncategorias disponíveis: ${matchTypeConcat}`,
  async execute(message, args) {
    const { client } = message;

    if (!args?.length || args?.length < 2) {
      message.reply(
        `Informe ao menos o número de partidas e a categoria\n\`${matchTypeConcat}\``,
      );
      return;
    }

    const numberOfMatches = Math.abs(Number(args[0]));
    const matchType = args[1];
    const numberOfPlayers = args?.length >= 3 ? Math.abs(Number(args[2])) : 2;

    if (!matchTypeList.includes(args[1])) {
      message.reply(
        `Categoria da partida inválida, categorias disponíveis:\n${matchTypeConcat}`,
      );
      return;
    }

    // Validade args
    if (
      Number.isNaN(numberOfMatches) ||
      numberOfMatches === 0 ||
      numberOfMatches > MAX_NUMBER_OF_MATCHES
    ) {
      message.reply(
        `A quantidade de partidas está inválida ou ultrapassou o limite de ${MAX_NUMBER_OF_MATCHES}.`,
      );
      return;
    }

    const maxNumberOfPlayers =
      matchesSettings.find(setting => setting.type === matchType)
        ?.maxNumberOfPlayers ?? 2;

    if (
      Number.isNaN(numberOfPlayers) ||
      numberOfPlayers <= 1 ||
      numberOfPlayers > maxNumberOfPlayers ||
      numberOfPlayers % 2 !== 0
    ) {
      message.reply(
        `Quantidade de jogadores inválida: deve ser um número par entre 2 e ${maxNumberOfPlayers}.`,
      );
      return;
    }

    // if (numberOfMatches % 2 === 0) {
    //   message.reply(`Só é possível criar partidas com número ímpar de jogos`);
    //   return;
    // }

    // check for unfinished games
    const findUnfinishedMatchService = new FindUnfinishedMatchService();
    try {
      const unfinishedMatch = await findUnfinishedMatchService.execute({
        playerId: message.author.id,
      });

      if (unfinishedMatch) {
        message.reply(
          `Você está participando na partida \`${unfinishedMatch._id}\`, por favor compute os pontos antes de criar uma nova partida`,
        );
        return;
      }
    } catch (error) {
      client.logger?.log('error', 'Erro no comando match', error);
    }

    // custom emoji
    // const reactionEmoji = message?.guild?.emojis.cache.find(
    //   emoji => emoji.name === 'ayy',
    // );
    // if (reactionEmoji) {
    //   message.react(reactionEmoji);
    // }
    // await message.react('👍');

    const matchMentionRoleName =
      matchesSettings.find(matchSetting => matchSetting.type === matchType)
        ?.role ?? '';

    // get role by name
    const matchMentionRole = message?.guild?.roles.cache.find(
      role => role.name === matchMentionRoleName,
    );

    const mentionMatchTo = matchMentionRole
      ? `<@&${matchMentionRole?.id}>`
      : '';

    const matchCreateMessage = await message.channel.send(
      `${mentionMatchTo} ${
        message.author.username
      } está procurando uma disputa para \`${matchType}\` de ${numberOfMatches} partidas para ${numberOfPlayers} jogadores, utilize reaction 👍 em até ${
        matchMaxAwaitingTime / 60000
      } minuto(s) para aceitar`,
    );

    await matchCreateMessage.react('👍');

    const reactionFilter: Discord.CollectorFilter = async (
      reaction,
      user: Discord.ClientUser,
    ) => {
      if (user.bot) {
        return false;
      }

      const reactUnfinishedMatch = await findUnfinishedMatchService.execute({
        playerId: user.id,
      });

      const existsUnfinishedMatch = !!reactUnfinishedMatch;

      return (
        user.id !== message.author.id && // match creator cant accept own game
        !existsUnfinishedMatch && // if opponent already have unfinished game cant accept
        ['👍'].includes(reaction.emoji.name)
      );
    };

    try {
      // filter  => determine whether a reaction needs to be collected
      // options => determine when to stop collecting reacts
      const collectedReaction = await matchCreateMessage.awaitReactions(
        reactionFilter,
        {
          // max: numberOfPlayers, //The maximum total amount of reactions to collect
          maxEmojis: numberOfPlayers - 1, // The maximum number of emojis to collect
          maxUsers: numberOfPlayers - 1, // The maximum number of users to react
          time: matchMaxAwaitingTime,
          errors: ['time'],
        },
      );

      const reactions = collectedReaction.first();

      const playersIds = reactions?.users.cache
        // remove author if reacted to own game
        .filter(user => !user.bot && user.id !== message.author.id)
        .array()
        .map(user => user.id);

      if (playersIds && playersIds.length === numberOfPlayers - 1) {
        playersIds?.push(message.author.id); // include the host id in the match shuffle
        const shuffedPlayersIds = knuthShuffleArray(playersIds);

        const {
          firstHalf: team1Players,
          secondHalf: team2Players,
        } = splitArrayByHalf(shuffedPlayersIds);

        const createMatchService = new CreateMatchService();

        const createdMatch = await createMatchService.execute({
          matchType,
          numberOfMatches,
          hostPlayerId: message.author.id,
          team1Players,
          team2Players,
        });

        if (createdMatch) {
          const team1Mention = team1Players
            .map(playerId => `<@${playerId}>`)
            .join('\n');
          const team2Mention = team2Players
            .map(playerId => `<@${playerId}>`)
            .join('\n');

          message.reply(
            `Partida criada entre: ${team1Mention} vs ${team2Mention}`,
          );

          const createdMatchMessage = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Partida Criada`)
            .setDescription(
              `\`${createdMatch._id}\` - ${createdMatch.matchType}`,
            )
            .addFields(
              { name: 'Time 1', value: team1Mention, inline: true },
              { name: 'Time 2', value: team2Mention, inline: true },
              {
                name: 'Pontos',
                value: 'Ao terminar compute os pontos usando o comando pontos',
              },
            )
            .setTimestamp();

          message.reply(createdMatchMessage);
        }

        //
      }
    } catch (error) {
      client.logger?.log('error', error);

      message.reply(
        'A partida não teve número suficiente de jogadores que aceitaram participar ou ocorreu um erro ao tentar registrá-la, partida cancelada.',
      );
    }
  },
};

export default command;
