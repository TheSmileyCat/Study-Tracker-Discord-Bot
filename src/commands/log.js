import { InteractionContextType, SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags, Message } from 'discord.js';
import { setLogChannel, clearLogChannel, getLogChannel, getLogStatus, setLogStatus } from '../db.js';

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

                break;
            }

            case 'start': {
                if (!getLogChannel(interaction.guildId)) {
                    await interaction.reply({
                        content: "you must set a channel first before you can start logging",
                        flags: MessageFlags.Ephemeral
                    });

                    return;
                }
                if (getLogStatus(interaction.guildId)) {
                    await interaction.reply({
                        content: "The logging is already active",
                        flags: MessageFlags.Ephemeral
                    });

                    return;
                }

                setLogStatus(interaction.guildID, true);

                await interaction.reply({
                    content: "Logging is now active!",
                    flags: MessageFlags.Ephemeral
                })

                break;
            }

            case 'stop': {
                if (!getLogChannel(interaction.guildId)) {
                    await interaction.reply({
                        content: "you must set a channel first before you can stop logging",
                        flags: MessageFlags.Ephemeral
                    });
                    
                    return;
                }
                if (!getLogStatus(interaction.guildId)) {
                    await interaction.reply({
                        content: "The logging is already inactive",
                        flags: MessageFlags.Ephemeral
                    });

                    return;
                }

                setLogStatus(interaction.guildId, false)

                await interaction.reply({
                    content: "Logging is now inactive!",
                    flags: MessageFlags.Ephemeral
                })

                break;
            }
        }
    }

}