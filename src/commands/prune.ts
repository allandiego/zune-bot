/* eslint-disable consistent-return */

import { IDiscordCommand } from './types';

const command: IDiscordCommand = {
  name: 'prune',
  description: 'Prune up to 99 messages.',
  execute(message, args) {
    const amount = parseInt(args[0], 10) + 1;

    if (Number.isNaN(amount)) {
      return message.reply("that doesn't seem to be a valid number.");
    }
    if (amount <= 1 || amount > 100) {
      return message.reply('you need to input a number between 1 and 99.');
    }

    message.channel.bulkDelete(amount, true).catch(err => {
      console.error(err);
      message.channel.send(
        'there was an error trying to prune messages in this channel!',
      );
    });
  },
};

export default command;
