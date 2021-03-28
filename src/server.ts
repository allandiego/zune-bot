import '@config/env';
import Discord from 'discord.js';
import mongoose from 'mongoose';

import { IDiscordClientEnhanced } from './types';
import { AppLogger } from './util';
import { WinstonLogger } from './util/Log/WinstonLogger';
import { commands } from './commands';
import { events } from './events';

const client: IDiscordClientEnhanced = new Discord.Client({
  disableMentions: 'none',
});

const winstonLogger = new WinstonLogger();
const logger = new AppLogger(winstonLogger);
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.logger = logger;

async function initDB() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // enable use of findByIdAndUpdate() without deprecation
    useFindAndModify: false,
    // enable use of Schema.index() without deprecation
    useCreateIndex: true,
  });

  logger.log('info', 'DB connected!');
}

function setCommands() {
  commands.forEach(command => {
    client.logger?.log('info', `Command Loaded => ${command.name}`);

    client.commands?.set(command.name, command);
  });
}

function setEvents() {
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
    await initDB();
    setCommands();
    setEvents();

    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    logger.log('error', 'BOT startUp Error', error);
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
