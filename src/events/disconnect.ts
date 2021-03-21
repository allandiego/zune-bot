import { IDiscordEventWithClient } from '../types';

const disconnectEvent: IDiscordEventWithClient = {
  name: 'disconnect',
  execute: async client => {
    try {
      client.logger.warn(`Bot (${client.user?.tag}) disconnected...`);
    } catch (error) {
      console.log(error);
    }
  },
};

export default disconnectEvent;
