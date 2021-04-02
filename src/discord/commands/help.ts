import { IDiscordCommand } from '@discord/types';
import { commandPrefix } from '@config/command';

const command: IDiscordCommand = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands', 'comandos', 'ajuda'],
  usage: '[command name]',
  cooldown: 5,
  async execute(message, args) {
    const data = [];
    const { client } = message;
    const { commands } = client;

    if (!args?.length) {
      data.push("Here's a list of all my commands:");
      data.push(
        commands
          ?.map(cmd => {
            return cmd.aliases
              ? `**${commandPrefix}${
                  cmd.name
                }** - \`[${commandPrefix}${cmd.aliases?.join(
                  `, ${commandPrefix}`,
                )}]\``
              : `**${commandPrefix}${cmd.name}**`;
          })
          .join('\n'),
      );
      data.push(
        `\nYou can send \`${commandPrefix}help [command name]\` to get info on a specific command!`,
      );

      try {
        await message.author.send(data, { split: true });
        // if (message.channel.type === 'dm') return;
        // message.reply("I've sent you a DM with all my commands!");
      } catch (error) {
        client.logger?.log(
          'error',
          `Could not send help DM to ${message.author.tag}.\n`,
          error,
        );

        message.reply("it seems like I can't DM you!");
      }
    }

    if (args?.length) {
      const name = args[0].toLowerCase();
      const commandHelp =
        commands?.get(name) ||
        commands?.find(cmd => cmd.aliases?.includes(name) ?? false);

      if (!command) {
        message.reply("that's not a valid command!");
        return;
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

      if (commandHelp?.requiredPermissions) {
        data.push(
          `**Permissions:** \`${commandHelp?.requiredPermissions.join(', ')}\``,
        );
      }

      if (commandHelp?.requiredRoles) {
        data.push(`**Roles:** ${commandHelp?.requiredRoles.join(', ')}`);
      }

      message.channel.send(data, { split: true });
    }
  },
};

export default command;
