import { IDiscordCommand } from '../types';

const command: IDiscordCommand = {
  name: 'args',
  description: 'Information about the arguments provided.',
  aliases: ['args-info'],
  isArgumentsRequired: true,
  usage: '<any arg1> <any arg1> ...',
  execute(message, args) {
    if (!args?.length) {
      return message.channel.send(
        `You didn't provide any arguments, ${message.author}!`,
      );
    }

    return message.channel.send(`Arguments: \`${args.join(', ')}\``);
  },
};

export default command;
