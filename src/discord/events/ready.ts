import { IDiscordEventWithClient } from '@discord/types';
import { commandPrefix } from '@discord/commands';

const readyEvent: IDiscordEventWithClient = {
  name: 'ready',
  once: true,
  execute: async client => {
    try {
      client.user?.setUsername(process.env.DISCORD_BOT_NAME);
      client.user?.setStatus('online');

      client.user?.setPresence({
        afk: false,
        activity: {
          name: `${commandPrefix}help`,
          type: 'PLAYING',
          // url: '',
        },
      });

      // List servers where bot is connected
      client.logger?.log('info', `${client.user?.tag} connected Guilds:`);
      client.guilds.cache.map(async guild => {
        client.logger?.log(
          'info',
          ` > ${guild.id} - ${guild.name} - Members: ${guild.memberCount}`,
        );
      });

      client.logger?.log(
        'info',
        `Bot (${client.user?.tag}) is now up and running! 🚀`,
      );
    } catch (error) {
      client.logger?.log('error', 'Erro ao iniciar o bot', error);
    }
  },
};

export default readyEvent;
