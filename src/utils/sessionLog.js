import { EmbedBuilder } from 'discord.js';
import { getLogChannel, getLogStatus } from '../db.js';
import { capitalise, formatMinutes } from './format.js';

export const sendSessionLog = async (client, user, { guildId, subject, minutes }) => {
    console.log('[log] status:', getLogStatus(guildId), 'channel:', getLogChannel(guildId));
    if (!getLogStatus(guildId)) return;

    const channelId = getLogChannel(guildId);
    if (!channelId) return;

    const guild = client.guilds.cache.get(guildId);
    const channel = await guild?.channels.fetch(channelId).catch(() => null);
    if (!channel?.isSendable()) return;

    const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
        .setDescription(
            `<@${user.id}> studied **${capitalise(subject)}** for **${formatMinutes(minutes)}**.`,
        )
        .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(console.error);
};