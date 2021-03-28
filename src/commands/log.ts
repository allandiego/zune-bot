import path from 'path';

import { IDiscordCommand } from '../types';

const command: IDiscordCommand = {
  name: 'log',
  description: 'Baixa os arquivos de log do bot',
  cooldown: 10,
  guildOnly: false,
  requiredPermissions: ['ADMINISTRATOR'],
  async execute(message, args) {
    const { client } = message;

    try {
      const logFile = path.join(
        __dirname,
        '..',
        '..',
        'log',
        `log-combined.log`,
      );

      const logErrorFile = path.join(
        __dirname,
        '..',
        '..',
        'log',
        `log-error.log`,
      );

      await message.channel.send({
        files: [
          {
            attachment: logFile,
            name: `log.txt`,
          },
          {
            attachment: logErrorFile,
            name: `log-error.txt`,
          },
        ],
      });
    } catch (error) {
      message.reply('Erro ao tentar enviar os logs');
      client.logger?.log('error', 'Erro no comando log', error);
    }
  },
};

export default command;
