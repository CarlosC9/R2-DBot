import { Client, Intents } from 'discord.js';
import Commands from './commands/initCommands';
import { Player } from 'discord-player';

// Token
const token = require('minimist')(process.argv.slice(2))['token'];

// Client
const client = new Client(
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_VOICE_STATES,
        ],
    }
);

// Player music
const player = new Player(client);

// Initialize App
async function init() {

    new Commands(client, player);

    client.once('ready', () => {
        client.application?.commands.create({
            type: "MESSAGE",
            name: '!play',
        });
        console.log('Bot is ready!');

    });

    client.login(token);
}

init();