import { MessageEmbed, User as DiscordUser } from 'discord.js';

import { IDiscordCommand } from '@discord/types';

const command: IDiscordCommand = {
  name: 'avatar',
  description: 'Get the avatar URL of the tagged user(s), or your own avatar.',
  aliases: ['icon'],
  execute(message) {
    function generateEmbedAvatar(discordUser: DiscordUser) {
      const embedAvatar = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${discordUser.tag} Avatar's`)
        .addFields({
          name: 'Links',
          value: `[PNG](${discordUser.displayAvatarURL({
            format: 'png',
            size: 1024,
          })}) | [JPG](${discordUser.displayAvatarURL({
            format: 'jpg',
            size: 1024,
          })}) | [GIF](${discordUser.displayAvatarURL({
            format: 'gif',
            size: 1024,
          })}) | [WEBP](${discordUser.displayAvatarURL({
            format: 'webp',
            size: 1024,
          })})`,
        })
        .setImage(discordUser.displayAvatarURL({ format: 'png', size: 512 }));

      return embedAvatar;
    }

    if (!message.mentions.users.size) {
      message.channel.send(generateEmbedAvatar(message.author));
      return;
    }

    message.mentions.users.map(user =>
      message.channel.send(generateEmbedAvatar(user)),
    );
  },
};

export default command;
