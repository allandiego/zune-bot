import { IDiscordCommand } from '@discord/types';

const command: IDiscordCommand = {
  name: 'ping',
  description: 'Ping!',
  cooldown: 5,
  execute(message) {
    const { client } = message;

    message.channel.send('Pong');

    client.guilds.cache.map(async guild => {
      client.logger?.log(
        'info',
        ` (${guild.id}) - ${guild.name} - Members: ${guild.memberCount}`,
      );
    });

    // await Promise.all(
    //   client.guilds.cache.map(async guild => {
    //     if (guild.id !== 'xxxx') {
    //       await guild.leave();
    //     }
    //   }),
    // );
  },
};

export default command;
