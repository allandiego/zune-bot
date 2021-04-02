import Discord from 'discord.js';

import { IDiscordCommand } from '@discord/types';
import { moderatorRoleName, rankedRoles } from '@config/matchmaking';
import DeleteScoreService from '@services/matchmaking/score/DeleteScoreService';

const command: IDiscordCommand = {
  name: 'rank-reset',
  description: 'Reseta todo o rank e hitórico de partidas',
  cooldown: 5,
  guildOnly: true,
  // userDiscordPermissions: ['ADMINISTRATOR'],
  requiredRoles: [moderatorRoleName],
  isArgumentsRequired: false,
  async execute(message, args) {
    // const isMod = message.member?.roles.cache.find(
    //   role => role.name === moderatorRoleName,
    // );

    // if (!isMod) {
    //   message.reply(`Você não tem permissão para executar esse comando`);
    //   return;
    // }

    // remove all rankings roles from users
    const deleteDataMessage = await message.reply(
      `Para resetar todo o histórico de partidas e rankings utilize reaction 👍 em até 1 minuto(s) para confirmar`,
    );

    await deleteDataMessage.react('👍');

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
      const collectedReaction = await deleteDataMessage.awaitReactions(
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
        const deleteScoreService = new DeleteScoreService();

        const deleteResult = await deleteScoreService.execute();

        if (deleteResult) {
          message.reply(
            `Histórico de partidas e rankings resetados com sucesso!`,
          );
        }

        // delete and recreate score rank roles
        try {
          const rankedRolesNames = rankedRoles.map(role => role.name);

          const rankRolesToDelete = message.guild?.roles.cache.filter(role =>
            rankedRolesNames.includes(role.name),
          );

          const rankRolesToCreate = rankedRoles.map(role => ({
            name: role.name,
            color: role.color,
          }));

          if (rankRolesToDelete && rankRolesToCreate) {
            await Promise.all(
              rankRolesToDelete.map(async role => {
                await role.delete(
                  `Bot rank reset command used by <@${message.author.id}> - ${message.author.username}`,
                );
              }),
            );

            await Promise.all(
              rankRolesToCreate.map(async role => {
                await message.guild?.roles.create({
                  data: {
                    name: role.name,
                    color: role.color,
                    // hoist: role.hoist,
                    // position: role.position,
                    // permissions: role.permissions,
                    // mentionable: role.mentionable,
                  },
                });
              }),
            );
          }
        } catch (error) {
          message.reply('Erro ao tentar ressetar os cargos de rank');
        }
      }
    } catch (error) {
      message.reply(
        'Erro: Não foi possível apagar o histórico de partidas e rankings',
      );
    }
  },
};

export default command;
