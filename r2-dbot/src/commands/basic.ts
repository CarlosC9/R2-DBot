import { Player } from "discord-player";
import { Client, Guild, Message } from "discord.js";
import { BOT_REPLY } from "./initCommands";

export enum COMMANDS_BASIC {
    DISCONNECT_VOICE = '!disconnect',
}

export default class BasicCommands {

    constructor(private client: Client, private player: Player) {

        this.client.on('messageCreate', (message: Message) => {
            if (message.content.charAt(0) === '!' && message.guild) {
                switch (message.content.split(" ")[0].toLowerCase()) {
                    case COMMANDS_BASIC.DISCONNECT_VOICE:
                        this.disconnectBot(message);
                        break;
                }
            }
        });
        
    }

    private getMessageReply(message: Message, typeMessage: BOT_REPLY, alternative?: number): string {
        switch (typeMessage) {
            case BOT_REPLY.NOT_ON_A_VOICE_CHANNEL:
                return `No me han llamando a ningun sitio. :smiling_face_with_tear:`;
            case BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL:
                return `No estas en mi mismo canal. :rage:`;
            case BOT_REPLY.BOT_DISCONNECT_VOICE_CHANNEL:
                return `¡Espero que nos veamos de nuevo!`;
            default:
                return ``;
        }
    }

    private async disconnectBot(message: Message) {

        if (!message.guild?.me?.voice.channelId) {
            await message.reply(this.getMessageReply(message, BOT_REPLY.NOT_ON_A_VOICE_CHANNEL));
            return;
        }

        if (!message.member?.voice.channelId) {
            await message.reply(this.getMessageReply(message, BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL));
            return;
        }

        if (message.member?.voice.channelId != message.guild?.me?.voice.channelId) {
            await message.reply(this.getMessageReply(message, BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL));
            return;
        }

        const queue = this.player.getQueue(<Guild>message.guild);
        if (queue) {
            queue.destroy();
        }

        await message.channel.send(this.getMessageReply(message, BOT_REPLY.BOT_DISCONNECT_VOICE_CHANNEL));
        await message.guild?.me?.voice.disconnect();
        return;
    }

}