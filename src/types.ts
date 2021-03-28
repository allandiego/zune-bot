import {
  Message as DiscordMessage,
  Client as DiscordClient,
  Collection as DiscordColletion,
} from 'discord.js';

import { ILog } from './util/Log/ILog';

interface DiscordMessageWithDiscordClientEnhanced extends DiscordMessage {
  client: IDiscordClientEnhanced;
}

type DiscordPermissionString =
  | 'CREATE_INSTANT_INVITE'
  | 'KICK_MEMBERS'
  | 'BAN_MEMBERS'
  | 'ADMINISTRATOR'
  | 'MANAGE_CHANNELS'
  | 'MANAGE_GUILD'
  | 'ADD_REACTIONS'
  | 'VIEW_AUDIT_LOG'
  | 'PRIORITY_SPEAKER'
  | 'STREAM'
  | 'VIEW_CHANNEL'
  | 'SEND_MESSAGES'
  | 'SEND_TTS_MESSAGES'
  | 'MANAGE_MESSAGES'
  | 'EMBED_LINKS'
  | 'ATTACH_FILES'
  | 'READ_MESSAGE_HISTORY'
  | 'MENTION_EVERYONE'
  | 'USE_EXTERNAL_EMOJIS'
  | 'VIEW_GUILD_INSIGHTS'
  | 'CONNECT'
  | 'SPEAK'
  | 'MUTE_MEMBERS'
  | 'DEAFEN_MEMBERS'
  | 'MOVE_MEMBERS'
  | 'USE_VAD'
  | 'CHANGE_NICKNAME'
  | 'MANAGE_NICKNAMES'
  | 'MANAGE_ROLES'
  | 'MANAGE_WEBHOOKS'
  | 'MANAGE_EMOJIS';

export interface IDiscordCommand {
  name: string;
  description: string;
  cooldown?: number;
  guildOnly?: boolean;
  aliases?: string[];
  usage?: string;
  isArgumentsRequired?: boolean;
  requiredPermissions?: DiscordPermissionString[];
  requiredRoles?: string[];
  execute(
    message: DiscordMessageWithDiscordClientEnhanced,
    commandArgs?: any[],
  ): void | Promise<DiscordMessage | void>;
}

export interface IDiscordMessageEvent {
  name: 'message';
  once?: boolean;
  execute: (
    client: IDiscordClientEnhanced,
    message: DiscordMessageWithDiscordClientEnhanced,
  ) => Promise<DiscordMessage | undefined | void>;
}

export interface IDiscordEventWithClient {
  name: string;
  once?: boolean;
  execute: (
    client: IDiscordClientEnhanced,
    ...args: any[]
  ) => Promise<DiscordMessage | undefined | void>;
}

export interface IDiscordClientEnhanced extends DiscordClient {
  commands?: DiscordColletion<string, IDiscordCommand>;
  events?: DiscordColletion<
    string,
    IDiscordMessageEvent | IDiscordEventWithClient
  >;
  cooldowns?: DiscordColletion<string, DiscordColletion<string, number>>;
  data?: any;
  logger?: ILog;
}
