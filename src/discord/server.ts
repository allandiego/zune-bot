import '@config/env';
import Discord from 'discord.js';

import { IDiscordClientEnhanced } from '@discord/types';
import { commands } from '@discord/commands';
import { events } from '@discord/events';
import { WinstonLoggerProvider } from '@providers/LoggerProvider/implementations/WinstonLoggerProvider';
import { AgendaSchedulerProvider } from '@providers/SchedulerProvider/implementations/Agenda/AgendaSchedulerProvider';
import { initDatabase } from '@database/index';
import { loggerConfig } from '@config/logger';
import { schedulerConfig } from '@config/scheduler';

const client: IDiscordClientEnhanced = new Discord.Client({
  disableMentions: 'none',
});

const logger = new WinstonLoggerProvider(loggerConfig);
const scheduler = new AgendaSchedulerProvider(schedulerConfig);

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.logger = logger;
client.scheduler = scheduler;

function loadCommands() {
  commands.forEach(command => {
    client.logger?.log('info', `Command Loaded => ${command.name}`);

    client.commands?.set(command.name, command);
  });
}

function loadEvents() {
  events.forEach(event => {
    client.logger?.log('info', `Event Loaded => ${event.name}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  });
}

async function startUp() {
  try {
    loadCommands();
    loadEvents();

    await initDatabase();
    logger.log('info', 'DB initialized!');

    await client.scheduler?.start();
    logger.log('info', 'Scheduler initialized!');

    client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    logger.log('error', 'BOT startUp Error', error);
    await client.scheduler?.stop();
    client.destroy();
  }
}

startUp();

// HANDLE ERRORS
client.on('debug', debug => logger.log('debug', debug));
client.on('warn', warn => logger.log('warn', warn));
client.on('error', error => logger.log('error', 'Error', error));

// For any unhandled errors
process.on('uncaughtException', error => logger.log('error', 'Error', error));
