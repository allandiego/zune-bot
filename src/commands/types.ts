import {
  Message as DiscordMessage,
  Client as DiscordClient,
  Collection as DiscordColletion,
} from 'discord.js';

export interface IDiscordCommand {
  name: string;
  description: string;
  cooldown?: number;
  guildOnly?: boolean;
  aliases?: string[];
  usage?: string;
  isArgumentsRequired?: boolean;
  execute(
    message: DiscordMessage,
    args?: string[],
  ): void | Promise<void> | Promise<DiscordMessage>;
}

export interface IDiscordClientWithCommands extends DiscordClient {
  commands?: DiscordColletion<string, IDiscordCommand>;
}
