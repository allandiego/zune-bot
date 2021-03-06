import { IDiscordCommand } from '@discord/types';

const command: IDiscordCommand = {
  name: 'kick',
  description: 'Tag a member and kick them (but not really).',
  requiredPermissions: ['KICK_MEMBERS'],
  guildOnly: true,
  execute(message) {
    if (!message.mentions.users.size) {
      return message.reply('you need to tag a user in order to kick them!');
    }

    const taggedUser = message.mentions.users.first();

    return message.channel.send(`You wanted to kick: ${taggedUser?.username}`);
  },
};

export default command;
