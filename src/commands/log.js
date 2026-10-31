import { InteractionContextType, SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags, Message } from 'discord.js';
import { setLogChannel, clearLogChannel, getLogChannel, getLogStatus } from '../db.js';

export default {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('allows you to set the log channel and start logs')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) =>
        sub
            .setName('set')
            .setDescription('Sets the channel for the logs to go in')
            .addChannelOption((o) =>
                o.setName('channel')
                .setDescription('choice of log channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
        sub
            .setName('start')
            .setDescription('starts the log')
        )
        .addSubcommand((sub) =>
        sub
            .setName('stop')
            .setDescription('stops the log')
    ),

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'set': {
                const channel = interaction.options.getChannel('channel', true);

                // Check message permissions inside of the channel
                const perms = channel.permissionsFor(interaction.guild.members.me);
                if (!perms?.has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
                    await interaction.reply({
                        content: `I need **View Channel**, **Send Messages** and **Embed Links** in ${channel} first.`,
                        flags: MessageFlags.Ephemeral
                    });

                    return;
                }

                setLogChannel(interaction.guildId, channel.id);
                await interaction.reply({
                    content: `Finished study sessions will now be logged in ${channel}.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            case 'start': {
                if (!getLogChannel()) {
                    interaction.reply({
                        content: "you must set a channel first before you can start logging",
                        flags: MessageFlags.Ephemeral
                    });

                    return;
                }
                if (getLogStatus(interaction.guildId) === 1) {
                    interaction.reply({
                        content: "The logging is already active",
                        flags: MessageFlags.Ephemeral
                    });
                }

                setLogStatus(interaction.guildID, true);

                interaction.reply({
                    content: "Logging is now active!",
                    flags: MessageFlags.Ephemeral
                })
            }

            case 'stop': {
                if (!getLogChannel(interaction.guildId)) {
                    interaction.reply({
                        content: "you must set a channel first before you can stop logging",
                        flags: MessageFlags.Ephemeral
                    });
                    
                    return;
                }
                if (getLogStatus(interaction.guildId) === 0) {
                    interaction.reply({
                        content: "The logging is already inactive",
                        flags: MessageFlags.Ephemeral
                    });
                }

                setLogStatus(interaction.guildId, false)

                interaction.reply({
                    content: "Logging is now inactive!",
                    flags: MessageFlags.Ephemeral
                })
            }
        }
    }

}