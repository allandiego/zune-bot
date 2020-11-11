/* eslint-disable consistent-return */
import { commandPrefix } from '@config/command';
import { IDiscordCommand, IDiscordClientWithCommands } from './types';

const command: IDiscordCommand = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 5,
  execute(message, args) {
    const data = [];
    const { commands } = message.client as IDiscordClientWithCommands;

    if (!args?.length) {
      data.push("Here's a list of all my commands:");
      data.push(commands?.map(cmd => cmd.name).join(', '));
      data.push(
        `\nYou can send \`${commandPrefix}help [command name]\` to get info on a specific command!`,
      );

      return message.author
        .send(data, { split: true })
        .then(() => {
          if (message.channel.type === 'dm') return;
          message.reply("I've sent you a DM with all my commands!");
        })
        .catch(error => {
          console.error(
            `Could not send help DM to ${message.author.tag}.\n`,
            error,
          );
          message.reply("it seems like I can't DM you!");
        });
    }

    const name = args[0].toLowerCase();
    const commandHelp =
      commands?.get(name) ||
      commands?.find(cmd => cmd.aliases?.includes(name) ?? false);

    if (!command) {
      return message.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${commandHelp?.name}`);

    if (commandHelp?.aliases)
      data.push(`**Aliases:** ${commandHelp?.aliases.join(', ')}`);
    if (commandHelp?.description)
      data.push(`**Description:** ${commandHelp?.description}`);
    if (commandHelp?.usage)
      data.push(
        `**Usage:** ${commandPrefix}${commandHelp?.name} ${commandHelp?.usage}`,
      );

    data.push(`**Cooldown:** ${commandHelp?.cooldown || 3} second(s)`);

    message.channel.send(data, { split: true });
  },
};

export default command;
