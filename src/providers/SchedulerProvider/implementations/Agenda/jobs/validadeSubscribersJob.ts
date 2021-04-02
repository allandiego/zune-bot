import '@config/env';
import ptBR, { format } from 'date-fns';
import Discord, { TextChannel } from 'discord.js';

import {
  guildId,
  subscriberRoleName,
  logChannelName,
} from '@config/subscription';
import FindActiveSubscriptionsService from '@services/subscription/FindActiveSubscriptionsService';
import { WinstonLoggerProvider } from '@providers/LoggerProvider/implementations/WinstonLoggerProvider';

// function splitArrayBy(array: any, n: number) {
//   return Array.from(Array(Math.ceil(array.length / n)), (_, i) =>
//     array.slice(i * n, i * n + n),
//   );
// }

export const validadeSubscribersJob = async (): Promise<void> => {
  const logger = new WinstonLoggerProvider({
    logFileName: 'log-schedule-combined.log',
    errorLogFileName: 'log-schedule-error.log',
  });

  const client = new Discord.Client();

  client.login(process.env.DISCORD_SCHEDULE_BOT_TOKEN);

  client.on('ready', async () => {
    try {
      const discordGuild = client.guilds.cache.find(
        guild => guild.id === guildId,
      );

      // const discordGuild = await client.guilds.fetch(guildId);

      if (discordGuild) {
        console.log(`GUILD ${discordGuild.id} => ${discordGuild.name}`);

        const logChannel = discordGuild.channels.cache.find(
          channel => channel.name === logChannelName && channel.type === 'text',
        ) as TextChannel | undefined;

        if (!logChannel) {
          logger.log(
            'warn',
            `Não foi possível localizar o canal \`${logChannelName}\` no discord para continuar com o processo de validação de assinaturas agendado`,
          );
          return;
        }

        const startDatetime = format(new Date(), 'dd/MM/yyyy H:m:ss', {
          locale: ptBR,
        });

        await logChannel.send(
          `Processo de validação de assinaturas dos membros iniciado \`${startDatetime}\``,
        );

        const subscriberRole = discordGuild.roles.cache.find(
          role => role.name === subscriberRoleName,
        );

        if (subscriberRole) {
          console.log(`ROLE ${subscriberRole.id} => ${subscriberRole.name}`);
          const guildMembers = await discordGuild?.members.fetch();
          // console.log('guildMembers');
          // console.log(guildMembers);

          const findActiveSubscriptionsService = new FindActiveSubscriptionsService();
          const activeSubscriptions = await findActiveSubscriptionsService.execute();
          const activeSubscriptionsDiscordUserIds = activeSubscriptions.map(
            subscription => subscription.discordUserId,
          );

          const expiredSubscriptionMembers = guildMembers.filter(
            member =>
              !member.user.bot &&
              !activeSubscriptionsDiscordUserIds.includes(member.user.id) &&
              member.roles.cache.some(role => role.name === subscriberRoleName),
          );

          if (expiredSubscriptionMembers.size !== 0) {
            // const batchData = splitArrayBy(expiredSubscriptionMembers, 10);
            // console.log(batchData);

            // const batchMembers = expiredSubscriptionMembers.
            // await Promise.all(
            //   batchMembers.map(async (member, idx) => {
            //     await member?.roles.remove(subscriberRole);
            //     logChannel.send(
            //       `Removido o cargo \`${subscriberRole}\` do usuário: ${member.user.tag} - ${member.user.id}`,
            //     );

            //     if(idx) {
            //       await new Promise(r => setTimeout(r, 3000));
            //     }
            //   }),
            // );

            const batchSize = 10;
            let countBatchSize = 0;
            // eslint-disable-next-line no-restricted-syntax
            for (const [idx, member] of expiredSubscriptionMembers) {
              try {
                countBatchSize += 1;

                // eslint-disable-next-line no-await-in-loop
                await member?.roles.remove(subscriberRole);
                // eslint-disable-next-line no-await-in-loop
                await logChannel.send(
                  `  -  Removido o cargo \`${subscriberRole.name}\` do usuário: \`${member.user.tag} - ${member.user.id}\``,
                );

                if (countBatchSize === batchSize) {
                  countBatchSize = 1;
                  // eslint-disable-next-line no-await-in-loop
                  await new Promise(r => setTimeout(r, 3000));
                }
              } catch (error) {
                // eslint-disable-next-line no-await-in-loop
                await logChannel.send(
                  `  -  Erro ao tentar remover o cargo \`${subscriberRole.name}\` do usuário \`${member.user.tag} - ${member.user.id}\``,
                );
              }
            }
          } else {
            await logChannel.send(
              `  -  Nenhum membro com assinatura expirada possui o cargo \`${subscriberRoleName}\``,
            );
          }
        } else {
          await logChannel.send(
            `Erro: Não foi possível localizar o cargo \`${subscriberRoleName}\``,
          );
        }

        const endDatetime = format(new Date(), 'dd/MM/yyyy H:m:ss', {
          locale: ptBR,
        });

        await logChannel.send(
          `Processo de validação de assinaturas finalizado \`${endDatetime}\``,
        );
        await logChannel.send(
          '-----------------------------------------------------------------',
        );
      }
    } catch (error) {
      logger.log(
        'error',
        'Erro ao executar processo de validação de assinantes agendada',
        error,
      );
    } finally {
      client.destroy();
      // client.emit('disconnect', 0, 0);
    }
  });

  // client.on('disconnect', async () => {
  //   client.destroy();
  // });
};
