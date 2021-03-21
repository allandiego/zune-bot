import { IDiscordCommand } from '../types';

const command: IDiscordCommand = {
  name: 'prune',
  description: 'Prune up to 100 messages.',
  async execute(message, args) {
    if (message.channel.type === 'dm') return;

    if (args?.length) {
      const amount = parseInt(args[0], 10) + 1;

      if (Number.isNaN(amount)) {
        message.reply("that doesn't seem to be a valid number.");
        return;
      }

      if (amount <= 1 || amount > 99) {
        message.reply('you need to input a number between 1 and 99.');
        return;
      }

      try {
        await message.channel.bulkDelete(amount, true);
        message.reply(`deleted ${amount} messages`);
      } catch (error) {
        console.error(error);
        message.channel.send(
          'there was an error trying to prune messages in this channel!',
        );
      }
    }
  },
};

export default command;
