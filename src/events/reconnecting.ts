import { IDiscordEventWithClient } from '../types';

const reconnectingEvent: IDiscordEventWithClient = {
  name: 'reconnecting',
  execute: async client => {
    try {
      client.logger.log(`Bot (${client.user?.tag}) reconnecting...`);
    } catch (error) {
      console.log(error);
    }
  },
};

export default reconnectingEvent;
