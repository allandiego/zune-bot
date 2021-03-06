import { IDiscordCommand } from '@discord/types';

const command: IDiscordCommand = {
  name: 'server-info',
  description: 'Display info about this server.',
  cooldown: 10,
  execute(message) {
    message.channel.send(
      `Server name: ${message.guild?.name}\nTotal members: ${message.guild?.memberCount}\nSince: ${message.guild?.createdAt}\nOwner: ${message.guild?.owner}`,
    );
  },
};

export default command;
