import path from 'path';
import fs from 'fs';

import { IDiscordCommand } from '@discord/types';

const command: IDiscordCommand = {
  name: 'log-reset',
  description: 'Delete os arquivos de log do bot',
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

      if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
      }

      if (fs.existsSync(logErrorFile)) {
        fs.unlinkSync(logErrorFile);
      }

      message.reply('Arquivos de logs resetados com sucesso');
    } catch (error) {
      message.reply('Erro ao tentar resetar os logs');
      client.logger?.log('error', 'Erro no comando log-reset', error);
    }
  },
};

export default command;
