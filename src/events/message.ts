import Discord from 'discord.js';

import { commandPrefix } from '../commands';
import { IDiscordMessageEvent } from '../types';

const messageEvent: IDiscordMessageEvent = {
  name: 'message',
  once: false,
  execute: async (_, message) => {
    try {
      const { client } = message;
      client.logger?.cmd(
        `${message.author.tag} in #${message.channel.name} sent: ${message.content}`,
      );

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
          `comando \`${commandPrefix}${commandName}\` não reconhecido`,
        );
        return;
      }

      // commands that can only be used in normal text channel
      if (command.guildOnly && message.channel.type !== 'text') {
        message.reply(
          'Esse comando só pode ser utilizado em cannal de texto, não podem ser executado em mensagem privada!',
        );
        return;
      }

      // commands that require certain permissions
      if (command.userPermission && message.channel.type !== 'dm') {
        const authorPerms = message.channel.permissionsFor(message.author);

        if (!authorPerms || !authorPerms.has(command.userPermission)) {
          // member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])
          message.reply('Você não tem permissão para executar esse comando');
          return;
        }
      }

      if (command.isArgumentsRequired && !args.length) {
        let reply = `${message.author} este comando requer parâmetros!`;

        if (command.usage) {
          reply += `\nUso correto: \`${commandPrefix}${command.name} ${command.usage}\``;
        }

        message.channel.send(reply);
        return;
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
        console.error(error);
        message.reply('Erro ao tentar executar o comando 💣💣!');
      }
    } catch (error) {
      console.log(error);
    }
  },
};

export default messageEvent;
