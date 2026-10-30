import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { REST, Routes } from 'discord.js';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [];
const commandsPath = join(import.meta.dirname, 'commands');

for (const file of readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
    const { default: command } = await import(pathToFileURL(join(commandsPath, file)).href);
    commands.push(command.data.toJSON());
}

const rest = new REST().setToken(DISCORD_TOKEN);

try {
    console.log(`Registering ${commands.length} command(s)...`)
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Done.');
} catch (error) {
    console.error(error);
}