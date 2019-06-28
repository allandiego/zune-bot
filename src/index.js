const fs = require("fs");
const Discord = require("discord.js");

require("dotenv").config({ path: "./src/.env" });
const { commandPrefix } = require("./config.json");

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./src/commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", message => {
  console.log(message.content);
  if (!message.content.startsWith(commandPrefix) || message.author.bot) return;

  const args = message.content.slice(commandPrefix.length).split(/ +/);

  const commandName = args.shift().toLowerCase();

  //load commands
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  //specific roles msg only
  if (command.guildOnly && message.channel.type !== "text") {
    return message.reply(
      "Comandos não podem ser executados em mensagens privadas!"
    );
  }

  //required args
  if (command.args && !args.length) {
    let reply = `Você não enviou nenhum parâmetro, ${message.author}!`;
    if (command.usage) {
      reply += `\nUso correto: \`${prefix}${command.name} ${command.usage}\``;
    }
    return message.channel.send(reply);
  }

  //command delay
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `por favor espere ${timeLeft.toFixed(
          1
        )} segundo(s) antes de reusar o comando \`${command.name}\``
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("Erro ao tentar executar o comando!");
  }
});

client.login(process.env.CLIENT_SECRET);
