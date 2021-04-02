import { IDiscordCommand } from '@discord/types';

const command: IDiscordCommand = {
  name: 'leave-guild',
  description: 'Leave Guild',
  usage: '<Guild ID>',
  cooldown: 5,
  requiredPermissions: ['ADMINISTRATOR'],
  isArgumentsRequired: true,
  async execute(message) {
    message.channel.send('Pong');
  },
};

export default command;
