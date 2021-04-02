import Discord from 'discord.js';

import { IDiscordCommand } from '@discord/types';
import { moderatorRoleName } from '@config/matchmaking';
import DeleteMatchService from '@services/matchmaking/match/DeleteMatchService';
import FindUnfinishedMatchService from '@services/matchmaking/match/FindUnfinishedMatchService';

const MAX_AWAIT_REACTION_TIME = 5 * 60 * 1000;

const command: IDiscordCommand = {
  name: 'match-cancel',
  description:
    'Cancela uma partida não finalizada (sem pontos computados) com a aprovação do oponente ou moderador',
  aliases: ['cancelar-partida', 'cancelar-jogo'],
  cooldown: 5,
  guildOnly: true,
  async execute(message, args) {
    const { client } = message;

    // check if author have a valid match to cancel
    try {
      const findUnfinishedMatchService = new FindUnfinishedMatchService();
      const unfinishedMatch = await findUnfinishedMatchService.execute({
        playerId: message.author.id,
      });

      if (!unfinishedMatch) {
        message.reply(
          `Você não está participando de nenhuma partida em aberto`,
        );
        return;
      }

      // get role by name
      const cancelMatchMentionRole = message?.guild?.roles.cache.find(
        role => role.name === moderatorRoleName,
      );

      const mentionCancelMatchTo = cancelMatchMentionRole
        ? `<@&${cancelMatchMentionRole?.id}>`
        : '';

      const teamsPlayers = unfinishedMatch.team1Players
        .concat(unfinishedMatch.team2Players)
        .filter(playerId => playerId !== message.author.id); // remove requester from accept list

      const approval = unfinishedMatch.team1Players.filter(
        playerId => playerId !== message.author.id,
      )
        ? unfinishedMatch.team1Players
        : unfinishedMatch.team2Players;

      const teamsMention = teamsPlayers
        .map(playerId => `<@${playerId}>`)
        .join(', ');

      const matchCancelMessage = await message.channel.send(
        `${mentionCancelMatchTo} ${teamsMention}, ${
          message.author.username
        } está querendo cancelar a partida \`${unfinishedMatch._id}\` (${
          unfinishedMatch.matchType
        }), utilize reaction 👍 em até ${
          MAX_AWAIT_REACTION_TIME / 60000
        } minuto(s) para aceitar`,
      );

      await matchCancelMessage.react('👍');

      const reactionFilter: Discord.CollectorFilter = async (
        reaction,
        user: Discord.ClientUser,
      ) => {
        const isMod =
          message.guild?.members.cache
            .find(member => member.id === user.id)
            ?.roles.cache.some(role =>
              [moderatorRoleName].includes(role.name),
            ) ?? false;

        return (
          !user.bot &&
          (approval.includes(user.id) || isMod) &&
          ['👍'].includes(reaction.emoji.name)
        );
      };

      const collectedReaction = await matchCancelMessage.awaitReactions(
        reactionFilter,
        {
          // max: 1,
          maxEmojis: 1,
          maxUsers: 1,
          time: MAX_AWAIT_REACTION_TIME,
          errors: ['time'],
        },
      );

      const firstReaction = collectedReaction.first();

      if (firstReaction?.emoji.name === '👍') {
        const deleteMatchService = new DeleteMatchService();

        await deleteMatchService.execute(unfinishedMatch._id);
        message.reply(
          `Partida \`${unfinishedMatch._id}\` cancelada com sucesso!`,
        );
      }
    } catch (error) {
      client.logger?.log('error', 'Erro no comando match-cancel', error);
      message.reply(`Não foi possível cancelar a partida`);
    }
  },
};

export default command;
