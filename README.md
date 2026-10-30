# Study Tracker Discord Bot

This is a bot that I thought up of on the fly in the middle of external exams for highschool.

## Project Quick Setup

You'll need a few things in order to setup the discord bot.

First, you'll need to create your own discord bot through the [Discord Developer Portal](https://discord.com/developers/home).

Discord comes with it's own [Getting Started](https://docs.discord.com/developers/quick-start/getting-started) tutorial to help you with the bot creation process

Once you have your discord bot setup you want to create a `.env` file and insert the following parameters
```sh
DISCORD_TOKEN=<DISCORD TOKEN>
CLIENT_SECRET=<CLIENT SECRET>
CLIENT_ID=<CLIENT ID>
GUILD_ID=<GUILD ID>

BOT_STATUS=<bot status (eg. online, idle, dnd)>
BOT_ACTIVITY=<the activity type (eg. custom, playing, watching)>
BOT_ACTIVITY_TEXT=<the activity text (e.g "studying")>
```
The first 4 are required. The `DISCORD_TOKEN` is the token of your bot, the `CLIENT_SECRET` is the client secret, the `CLIENT_ID` is the id of the discord bot and finally the `GUILD_ID` is the id of the server that you want to do the testing in. (there are currently no testing server only features available at the moment)
The `BOT_STATUS` section is completely optional however, in order to add a little bit of personality to the discord bot I would suggest using it.

Once you're done with that you're free to input the following command into the terminal:
```sh
npm install
```

When the install is complete you'll need to first deploy the slash commands with
```sh
npm run deploy
```
and then you can run the bot with
```sh
npm run start
```

## Deploying Slash Commands
```sh
npm run deploy
```

## Starting the Discord Bot
```sh
npm run start
```
