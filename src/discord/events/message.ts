import Discord from 'discord.js';

import { IDiscordMessageEvent } from '@discord/types';
import { commandPrefix } from '@discord/commands';

const messageEvent: IDiscordMessageEvent = {
  name: 'message',
  once: false,
  execute: async (_, message) => {
    const { client } = message;

    try {
      if (
        process.env.NODE_ENV !== 'production' &&
        message.channel.type === 'text'
      ) {
        client.logger?.log(
          'http',
          `${message.author.tag} in #${message.channel.name} sent: ${message.content}`,
        );
      }

      // Check if commands has prefix and its not another bot
      // if (msg.guild.id === serverID && msg.channel.id === channelID) {}
      if (
        !message.content.trim().startsWith(commandPrefix) ||
        message.author.bot
      ) {
        return;
      }

      const args = message.content.slice(commandPrefix.length).split(/ +/);
      const commandName = args.shift()?.toLowerCase() || '';

      const command =
        client.commands?.get(commandName) ??
        client.commands?.find(
          cmd => cmd.aliases?.includes(commandName) ?? false,
        );

      if (!command) {
        message.reply(
          `Comando \`${commandPrefix}${commandName}\` não reconhecido`,
        );
        return;
      }

      // check for args requirements
      if (command.isArgumentsRequired && !args.length) {
        let reply = `${message.author} este comando requer parâmetros!`;

        if (command.usage) {
          reply += `\nUso correto: \`${commandPrefix}${command.name} ${command.usage}\``;
        }

        message.channel.send(reply);
        return;
      }

      // commands that can only be used in normal text channel
      if (command.guildOnly && message.channel.type !== 'text') {
        message.reply(
          'Esse comando só pode ser utilizado em cannal de texto, não podem ser executado em mensagem privada!',
        );
        return;
      }

      // commands that require certain discord permissions
      if (command.requiredPermissions && message.channel.type !== 'dm') {
        const authorPermissions = message.channel.permissionsFor(
          message.author,
        );

        if (
          !authorPermissions ||
          !authorPermissions.has(command.requiredPermissions)
        ) {
          // member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])
          message.reply('Você não tem permissão para executar esse comando');
          return;
        }
      }

      // commands that require certain roles
      if (command.requiredRoles) {
        const { requiredRoles: commandUserRoles } = command;

        // const hasRole =
        //   message.guild?.members.cache
        //     .find(member => member.id === message.author.id)
        //     ?.roles.cache.some(role => userRoles.includes(role.name)) ?? false;

        const hasRole = message.member?.roles.cache.some(role =>
          commandUserRoles.includes(role.name),
        );

        if (!hasRole) {
          message.reply(
            `Você não tem as roles necessárias para executar esse comando \`${commandUserRoles.join(
              ', ',
            )}\``,
          );
          return;
        }
      }

      // command delay
      if (!client.cooldowns?.has(command.name)) {
        client.cooldowns?.set(command.name, new Discord.Collection());
      }

      const now = Date.now();
      const timestamps = client.cooldowns?.get(command.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps?.has(message.author.id)) {
        const expirationTime =
          (timestamps.get(message.author.id) ?? 0) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          message.reply(
            `por favor espere ${timeLeft.toFixed(
              1,
            )} segundo(s) antes de reusar o comando \`${command.name}\``,
          );
          return;
        }
      }

      timestamps?.set(message.author.id, now);
      setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);

      // Get guild database
      // const guildDB = await client.data.getGuildDB(message?.guild?.id);

      try {
        // Get the user database
        // const userDB = await client.data.getUserDB(message.author.id);
        // const data = {};
        // data.config = config;
        // data.user = userDB;
        // data.guild = guildDB;
        // data.cmd = cmd;

        command.execute(message, args);
        // command.execute(client, message, args, data);
      } catch (error) {
        client.logger?.log(
          'error',
          `Erro ao tentar executar o comando ${message.content}`,
          error,
        );

        message.reply('Erro ao tentar executar o comando 💣💣!');
      }
    } catch (error) {
      client.logger?.log('error', 'Erro no evento message', error);
    }
  },
};

export default messageEvent;
