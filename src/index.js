import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    ActivityType,
    Client, 
    Collection, 
    Events, 
    GatewayIntentBits, 
    MessageFlags 
} from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection();

const commandsPath = join(import.meta.dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const { default: command } = await import(pathToFileURL(filePath).href);

    if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] ${file} is missing "data" or "execute", skipping.`);
    }
}

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);

    readyClient.user.setPresence({
        activities: [{
            name: process.env.BOT_ACTIVITY_TEXT ?? 'studying',
            state: process.env.BOT_ACTIVITY_TEXT ?? 'studying',
            type: ActivityType[process.env.BOT_ACTIVITY_TYPE] ?? ActivityType.Custom
        }],
        status: process.env.BOT_STATUS ?? 'online',
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const message = { content: 'Something went wrong running that command.', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred ) {
            await interaction.followUp(message);
        } else {
            await interaction.reply(message);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);