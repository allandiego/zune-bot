/* eslint-disable consistent-return */

import '@config/env';
import Discord, { Message as DiscordMessage } from 'discord.js';

import { IDiscordClientWithCommands } from '@commands/types';
import { commandPrefix } from '@config/command';
import commands from './commands';

const client: IDiscordClientWithCommands = new Discord.Client();

client.commands = new Discord.Collection();
client.login(process.env.DISCORD_TOKEN);

commands.forEach(command => client.commands?.set(command.name, command));

// cooldowns<commandName, <authorId, cooldownAmount>
const cooldowns = new Discord.Collection<
  string,
  Discord.Collection<string, number>
>();

const onReady = () => {
  client.user?.setUsername(process.env.DISCORD_BOT_NAME);
  client.user?.setStatus('online');

  client.user?.setPresence({
    afk: false,
    activity: {
      name: '!help',
      type: 'PLAYING',
      // url: '',
    },
  });

  console.log('Discord Bot Ready! 🚀');
};

const onMessage = (message: DiscordMessage) => {
  console.log(message.content);
  // if (msg.guild.id === serverID && msg.channel.id === channelID) {}
  if (!message.content.trim().startsWith(commandPrefix) || message.author.bot)
    return;

  const args = message.content.slice(commandPrefix.length).split(/ +/);
  const commandName = args.shift()?.toLowerCase() || '';

  const command =
    client.commands?.get(commandName) ??
    client.commands?.find(cmd => cmd.aliases?.includes(commandName) ?? false);

  if (!command) return;

  // specific roles msg only
  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(
      'Comandos não podem ser executados em mensagens privadas!',
    );
  }

  if (command.isArgumentsRequired && !args.length) {
    let reply = `Você não enviou nenhum parâmetro, ${message.author}!`;

    if (command.usage) {
      reply += `\nUso correto: ${commandPrefix}${command.name} ${command.usage}`;
    }
    return message.channel.send(reply);
  }

  // command delay
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps?.has(message.author.id)) {
    const expirationTime =
      (timestamps.get(message.author.id) ?? 0) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `por favor espere ${timeLeft.toFixed(
          1,
        )} segundo(s) antes de reusar o comando \`${command.name}\``,
      );
    }
  }

  timestamps?.set(message.author.id, now);
  setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Erro ao tentar executar o comando 💣💣!');
  }
};

client.once('ready', onReady);
client.on('message', onMessage);
