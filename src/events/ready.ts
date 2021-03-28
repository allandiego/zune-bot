import { commandPrefix } from '@config/command';
import { IDiscordEventWithClient, IDiscordClientEnhanced } from '../types';

const readyEvent: IDiscordEventWithClient = {
  name: 'ready',
  once: true,
  execute: async (client: IDiscordClientEnhanced) => {
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
