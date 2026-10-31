import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import {getActiveSession, startSession, endSession, calculateSessionLength} from '../db.js';
import { sendSessionLog } from '../utils/sessionLog.js';

export default {
    data: new SlashCommandBuilder()
        .setName('study')
        .setDescription('Study tracker')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((sub) => 
        sub
            .setName('start')
            .setDescription('Start a session')
            .addStringOption((o) => o.setName('subject').setDescription('Subject').setRequired(true))
        )
        .addSubcommand((sub) =>
        sub
            .setName('stop')
            .setDescription('Stops the current session')
        )
        .addSubcommand((sub) => 
        sub
            .setName('current')
            .setDescription('shows the stats of the current session')
    ),

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'start': {
                const active = getActiveSession(interaction.user.id);

                if (active) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    const mins = Math.round((Date.now() - active.started_at) / 60000);
                    const where = active.guild_id === interaction.guildId
                        ? 'in this server'
                        : `in **${interaction.client.guilds.cache.get(active.guild_id)?.name ?? 'another server'}**`;

                    await interaction.editReply({
                        content: `You already have an active study session in **${where}** for the subject **${active.subject}** with a total of ${mins} minutes clocked so far. Use \`/study stop\` there first.`
                    });

                    return;
                }
                
                const subject = interaction.options.getString('subject', true);

                startSession(interaction.user.id, interaction.guildId, subject);
                
                await interaction.reply(`Your ${subject.toLowerCase()} study session has started!`);
                break;
            }

            case 'stop': {
                const result = endSession(interaction.user.id);

                if (!result) {
                    await interaction.reply({
                        content: "You don't have an active session. Start one with `/study start`.",
                        flags: MessageFlags.Ephemeral
                    });
                    break;
                }

                await interaction.reply(
                    `Nice Work! You studied a total of **${result.minutes}** minutes for the subject **${result.subject}**`
                );
                await sendSessionLog(interaction.client, interaction.user, result);
                break;
            }

            case 'current': {
                const active = getActiveSession(interaction.user.id);

                if (!active)  {
                    interaction.reply({
                        content: "You don't have an active session. Use `/study start [subject]` to start a session",
                        flags: MessageFlags.Ephemeral
                    });
                    break;
                }

                interaction.reply({
                    content: `You have been studying **${active.subject}** for **${calculateSessionLength(active.started_at)}** minutes`
                })

                break;
            }

            default:
                await interaction.reply({ content: 'Invalid subcommand' });
        }
    },
}