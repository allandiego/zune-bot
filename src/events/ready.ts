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
          name: '!help',
          type: 'PLAYING',
          // url: '',
        },
      });

      client.logger.ready(
        `Bot (${client.user?.tag}) is now up and running! 🚀`,
      );
    } catch (error) {
      console.log(error);
    }
  },
};

export default readyEvent;
