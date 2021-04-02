import { IDiscordEventWithClient } from '@discord/types';

const disconnectEvent: IDiscordEventWithClient = {
  name: 'disconnect',
  execute: async client => {
    try {
      client.logger?.log('warn', `Bot (${client.user?.tag}) disconnected...`);
    } catch (error) {
      client.logger?.log('error', 'Erro ao desconectar o bot', error);
    }
  },
};

export default disconnectEvent;
