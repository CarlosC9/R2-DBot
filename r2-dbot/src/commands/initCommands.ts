import { Player } from 'discord-player';
import { Client } from 'discord.js';
import BasicCommands from './basic';
import MusicCommands from './music';

export enum BOT_REPLY {
    NOT_ON_A_VOICE_CHANNEL,
    MEMBER_NOT_SAME_VOICE_CHANNEL,
    BOT_DISCONNECT_VOICE_CHANNEL,
    BOT_CANT_CONNECT_VOICE_CHANNEL,
}


export default class Commands {

    constructor(private client: Client, private player: Player) {

        new MusicCommands(this.client, this.player);
        new BasicCommands(this.client, this.player);

    }

}