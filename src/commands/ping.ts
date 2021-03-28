import { IDiscordCommand } from '../types';

const command: IDiscordCommand = {
  name: 'ping',
  description: 'Ping!',
  cooldown: 5,
  execute(message) {
    message.channel.send('Pong');
  },
};

export default command;
