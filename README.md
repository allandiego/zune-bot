# HOW TO SETUP YOUR BOT

  ## CREATE BOT APP CLIENT_ID and TOKEN
    https://discordapp.com/developers

  ## CREATE .env file based on .env.example placing you token

  ## RUN NODE BOT SERVER
```bash
npm install
npm run build
npm run start

# or run dev
# npm run dev
```

  ## ADD BOT TO YOUR DISCORD SERVER
    Example url to add bot to the server

    https://discord.com/oauth2/authorize?client_id=INSERT_YOUR_BOT_CLIENT_ID&scope=bot&permissions=INSERT_PERMISSIONS
    get client_id from https://discord.com/developers/applications
    get permissions from https://discordapi.com/permissions.html


# REFERENCES
https://discordjs.guide/
https://github.com/discordjs/guide/tree/master/code-samples


# EMBED MESSAGE EXAMPLE
https://discordjs.guide/popular-topics/embeds.html#embed-preview

```ts
const avatarEmbed = new MessageEmbed()
  .setColor('#0099ff')
  .setTitle(`${message.author.tag} Avatar's`)
  .setURL('https://discord.js.org/')
  .setAuthor(
    process.env.DISCORD_BOT_NAME ?? '',
    process.env.DISCORD_BOT_AVATAR_URL,
    // 'https://discord.js.org',
  )
  .setDescription('Some description here')
  .setThumbnail(message.author.displayAvatarURL())
  .addFields(
    {
      name: 'Links',
      value: `[PNG](${message.author.displayAvatarURL({
        format: 'png',
        size: 1024,
      })}) | [JPG](${message.author.displayAvatarURL({
        format: 'jpg',
        size: 1024,
      })}) | [GIF](${message.author.displayAvatarURL({
        format: 'gif',
        size: 1024,
      })}) | [WEBP](${message.author.displayAvatarURL({
        format: 'webp',
        size: 1024,
      })})`,
    },
    { name: '\u200B', value: '\u200B' },
    {
      name: 'Inline field title',
      value: 'Some value here',
      inline: true,
    },
    {
      name: 'Inline field title',
      value: 'Some value here',
      inline: true,
    },
  )
  .addField('\u200b', '\u200b')
  .addField('Inline field title', 'Some value here', true)
  .setImage(
    message.author.displayAvatarURL({ format: 'png', size: 512 }),
  )
.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png')
.setTimestamp();
```
