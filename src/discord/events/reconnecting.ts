import { IDiscordEventWithClient } from '@discord/types';

const reconnectingEvent: IDiscordEventWithClient = {
  name: 'reconnecting',
  execute: async client => {
    try {
      client.logger?.log('info', `Bot (${client.user?.tag}) reconnecting...`);
    } catch (error) {
      client.logger?.log('error', 'Erro ao reconectar o bot', error);
    }
  },
};

export default reconnectingEvent;
