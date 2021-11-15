import { Client, Intents } from 'discord.js';
import Commands from './commands/initCommands';
import { Player } from 'discord-player';

// Token
const token = process.env.TOKEN_BOT;

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
        console.log('Bot is ready!');

    });

    client.login(token);
}

init();