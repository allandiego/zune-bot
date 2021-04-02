import { GuildMember } from 'discord.js';

import { IDiscordEventWithClient } from '@discord/types';

const guildMemberAddEvent: IDiscordEventWithClient = {
  name: 'guildMemberAdd',
  once: false,
  execute: async (client, member: GuildMember) => {
    try {
      if (!member || member.user.bot) {
        return;
      }
      member.send('Bem vindo a comunidade X!');
      return;
    } catch (error) {
      client.logger?.log('error', 'Erro evento guildMemberAdd', error);
    }
  },
};

export default guildMemberAddEvent;
