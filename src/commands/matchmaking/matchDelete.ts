import Discord from 'discord.js';

import DeleteMatchService from '@services/matchmaking/match/DeleteMatchService';
import FindMatchService from '@services/matchmaking/match/FindMatchService';
import { moderatorRoleName } from '@config/match';
import { IDiscordCommand } from '../../types';

const command: IDiscordCommand = {
  name: 'match-delete',
  description: 'Deleta uma partida não finalizada (sem pontos computados)',
  aliases: ['apagar-partida', 'deletar-partida', 'apagar-jogo', 'deletar-jogo'],
  cooldown: 5,
  guildOnly: true,
  // userDiscordPermissions: ['ADMINISTRATOR'],
  requiredRoles: [moderatorRoleName],
  isArgumentsRequired: true,
  usage: `<identificador da partida>`,
  async execute(message, args) {
    const { client } = message;

    if (!args?.length || args?.length !== 1) {
      message.reply(`Informe o identificador da partida`);
      return;
    }

    // const isMod = message.member?.roles.cache.find(
    //   role => role.name === moderatorRoleName,
    // );

    // if (!isMod) {
    //   message.reply(`Você não tem permissão para executar esse comando`);
    //   return;
    // }

    // const modRole = message?.guild?.roles.cache.find(
    //   role => role.name === moderatorRoleName,
    // );
    // const modRoleId = modRole?.id;

    const matchId = args[0];
    const isValidId = matchId.match(/^[a-f\d]{24}$/i);

    if (!isValidId) {
      message.reply(`Identificador de partida \`${matchId}\` inválido`);
      return;
    }

    const findMatchService = new FindMatchService();
    const unfinishedMatch = await findMatchService.execute({
      _id: matchId,
      isFinished: false,
    });

    if (!unfinishedMatch) {
      message.reply(`A partida \`${matchId}\` não existe ou está finalizada`);
      return;
    }

    const matchDeleteMessage = await message.reply(
      `Para apagar a partida \`${matchId}\` utilize reaction 👍 em até 1 minuto(s) para confirmar`,
    );

    await matchDeleteMessage.react('👍');

    const reactionFilter: Discord.CollectorFilter = async (
      reaction,
      user: Discord.ClientUser,
    ) => {
      return (
        !user.bot &&
        user.id === message.author.id &&
        ['👍'].includes(reaction.emoji.name)
      );
    };

    try {
      const collectedReaction = await matchDeleteMessage.awaitReactions(
        reactionFilter,
        {
          // max: 1,
          maxEmojis: 1,
          maxUsers: 1,
          time: 1 * 60 * 1000,
          errors: ['time'],
        },
      );

      const firstReaction = collectedReaction.first();

      if (firstReaction?.emoji.name === '👍') {
        const deleteMatchService = new DeleteMatchService();

        await deleteMatchService.execute(matchId);
        message.reply(`Partida inacabada \`${matchId}\` deletada com sucesso!`);
      }
    } catch (error) {
      client.logger?.log('error', 'Erro no comando match-delete', error);

      message.reply(`Erro: Não foi possível apagar a partida \`${matchId}\``);
    }
  },
};

export default command;
