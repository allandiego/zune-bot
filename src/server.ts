import '@config/env';
import Discord from 'discord.js';
import mongoose from 'mongoose';

// import './database';
import { IDiscordClientEnhanced } from './types';
import { Logger } from './util';
import { commands } from './commands';
import { events } from './events';

const client: IDiscordClientEnhanced = new Discord.Client({
  disableMentions: 'none',
});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.logger = Logger;

async function initMongoDb() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // enable use of findByIdAndUpdate() without deprecation
    useFindAndModify: false,
    // enable use of Schema.index() without deprecation
    useCreateIndex: true,
  });
}

function setCommands() {
  commands.forEach(command => {
    client.logger.load(`Command => ${command.name}`);

    client.commands?.set(command.name, command);
  });
}

function setEvents() {
  events.forEach(event => {
    client.logger.load(`Event => ${event.name}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  });
}

async function startUp() {
  initMongoDb();
  setCommands();
  setEvents();

  // client.on('disconnect', message => {
  //   console.log(
  //     `${message.author.tag} in #${message.channel.name} sent: ${message.content}`,
  //   );
  // });

  client.login(process.env.DISCORD_TOKEN);
}

startUp();

// HANDLE ERRORS
client.on('error', error => client.logger.error(error));
client.on('warn', info => client.logger.warn(info));

// For any unhandled errors
process.on('unhandledRejection', error => {
  console.error(error);
});
