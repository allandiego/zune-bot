import { IDiscordCommand } from '../types';

const command: IDiscordCommand = {
  name: 'args-info',
  description: 'Information about the arguments provided.',
  aliases: ['args'],
  isArgumentsRequired: true,
  usage: '<user> <role>',
  execute(message, args) {
    if (!args?.length) {
      return message.channel.send(
        `You didn't provide any arguments, ${message.author}!`,
      );
    }
    if (args[0] === 'foo') {
      return message.channel.send('bar');
    }

    return message.channel.send(`Arguments: ${args.join(', ')}`);
  },
};

export default command;
