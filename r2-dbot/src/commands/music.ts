import { Player, Queue } from "discord-player";
import { Client, Guild, Message, MessageEmbed, TextBasedChannels } from "discord.js";
import { BOT_REPLY } from "./initCommands";

export enum COMMANDS_MUSIC {
    PLAY_MUSIC = "!play",
    PAUSE_MUSIC = "!pause",
    RESUME_MUSIC = "!resume",
    ADD_TRACK = "!addtrack",
    SKYP_TRACK = "!skip",
    SHOW_PLAYLIST = "!showplaylist",
}


export default class MusicCommands {

    constructor(private client: Client, private player: Player) {
        this.client.on('messageCreate', (message: Message) => {
            if (message.content.charAt(0) === '!' && message.guild) {

                switch (message.content.split(" ")[0].toLowerCase()) {
                    case COMMANDS_MUSIC.PLAY_MUSIC:
                        this.initMusic(message);
                        break;
                    case COMMANDS_MUSIC.PAUSE_MUSIC:
                        this.pauseMusic(message);
                        break;
                    case COMMANDS_MUSIC.RESUME_MUSIC:
                        this.resumeMusic(message);
                        break;
                    case COMMANDS_MUSIC.ADD_TRACK:
                        this.addTrack(message);
                        break;
                    case COMMANDS_MUSIC.SKYP_TRACK:
                        this.skipTrack(message);
                        break;
                    case COMMANDS_MUSIC.SHOW_PLAYLIST:
                        this.getPlayList(message);
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
                return `No estas en el mismo canal que yo.`;
            case BOT_REPLY.BOT_CANT_CONNECT_VOICE_CHANNEL:
                return `No puedo entrar en tu canal de voz`;
            default:
                return ``;
        }
    }

    private createQueue(message: Message): Queue<{ channel: TextBasedChannels }> {
        const queque = this.player.createQueue(<Guild>message.guild, {
            metadata: {
                channel: message.channel
            }
        });
        queque.options = {
            leaveOnEnd: true,
            leaveOnStop: true,
            leaveOnEmpty: false,
            leaveOnEmptyCooldown: 10000,
            autoSelfDeaf: true,
            ytdlOptions: { highWaterMark: 33554432 },
            initialVolume: 100,
            bufferingTimeout: 300,
        }
        return queque;
    }

    private async initMusic(message: Message): Promise<void> {
        if (message.content.split(" ").length < 2) {
            await message.channel.send(`¡Debes añadir una canción ${message.member?.displayName}!`);
            return;
        }
        let song = "";
        for (let i = 1; i < message.content.split(" ").length; i++) {
            song += `${message.content.split(" ")[i]} `;
        }

        if (!message.member?.voice.channelId) {
            await message.channel.send(`¡No estas en ningún canal de voz ${message.member?.displayName}!`);
            return;
        }

        let queue = this.player.getQueue(<Guild>message.guild);
        if (queue) {
            queue.destroy();
        }

        queue = this.createQueue(message);

        const track = await this.player.search(song, {
            requestedBy: message.member
        }).then(x => x.tracks[0]);
        if (!track) {
            await message.channel.send(`No se ha encontrado la canción "${track}".`);
            return;
        }

        try {
            if (!queue.connection && message.member.voice.channel) await queue.connect(message.member.voice.channel);
        } catch {
            queue.destroy();
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.BOT_CANT_CONNECT_VOICE_CHANNEL));
            return;
        }

        queue.play(track);

        const a = await message.channel.send(`Reproduciendo la canción ${track.title} [${track.duration}]`);
        return;
    }

    private async addTrack(message: Message): Promise<void> {
        let song = "";
        for (let i = 1; i < message.content.split(" ").length; i++) {
            song += `${message.content.split(" ")[i]} `;
        }

        if (!message.member?.voice.channelId) {
            await message.channel.send(`¡No estas en ningún canal de voz ${message.member?.displayName}!`);
            return;
        }

        const track = await this.player.search(song, {
            requestedBy: message.member
        }).then(x => x.tracks[0]);
        if (!track) {
            await message.channel.send(`No se ha encontrado la canción "${track}".`);
            return;
        }

        let queue = this.player.getQueue(<Guild>message.guild);
        if (!message.guild?.me?.voice.channelId && queue) {
            queue.destroy();
        }
        if (!queue) {
            queue = this.createQueue(message);

            try {
                if (!queue.connection && message.member.voice.channel) await queue.connect(message.member.voice.channel);
            } catch {
                queue.destroy();
                await message.channel.send(this.getMessageReply(message, BOT_REPLY.BOT_CANT_CONNECT_VOICE_CHANNEL));
                return;
            }

            queue.play(track);

        } else {

            queue.addTrack(track);

        }

        const a = await message.channel.send(`Añadiendo la canción a la lista de reproducción ${track.title} [${track.duration}]`);
        return;
    }

    private async pauseMusic(message: Message): Promise<void> {
        if (!message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.NOT_ON_A_VOICE_CHANNEL));
            return;
        }

        const queue = this.player.getQueue(<Guild>message.guild);
        if (!queue || !queue.playing) {
            await message.channel.send(`:coffee: No puedo pausar la música cuando me estoy tomando un cafe. :coffee:`);
            return;
        }

        if (!message.member?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL));
            return;
        }

        if (message.member?.voice.channelId != message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL));
            return;
        }

        queue.setPaused(true);

        await message.channel.send(`Pausando la canción ${queue.nowPlaying().title} ${queue.createProgressBar()}`);
        return;
    }

    private async resumeMusic(message: Message): Promise<void> {
        if (!message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.NOT_ON_A_VOICE_CHANNEL));
            return;
        }

        if (!message.member?.voice.channelId || message.member?.voice.channelId != message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL));
            return;
        }

        const queue = this.player.getQueue(<Guild>message.guild);
        if (!queue) {
            await message.channel.send(`:coffee: No puedo pausar la música cuando me estoy tomando un cafe. :coffee:`);
            return;
        }

        queue.setPaused(false);

        await message.channel.send(`Reproducciendo la canción ${queue.nowPlaying().title}`);
        return;
    }

    private async skipTrack(message: Message): Promise<void> {
        if (!message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.NOT_ON_A_VOICE_CHANNEL));
            return;
        }

        if (!message.member?.voice.channelId || message.member?.voice.channelId != message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL));
            return;
        }

        const queue = this.player.getQueue(<Guild>message.guild);
        if (!queue) {
            await message.channel.send(`No hay una lista de reproducción activa.`);
            return;
        }

        queue.skip();
    }

    private async getPlayList(message: Message): Promise<void> {
        if (!message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.NOT_ON_A_VOICE_CHANNEL));
            return;
        }

        if (!message.member?.voice.channelId || message.member?.voice.channelId != message.guild?.me?.voice.channelId) {
            await message.channel.send(this.getMessageReply(message, BOT_REPLY.MEMBER_NOT_SAME_VOICE_CHANNEL));
            return;
        }

        const queue = this.player.getQueue(<Guild>message.guild);
        if (!queue || !queue.playing) {
            await message.channel.send(`No hay una lista de reproducción activa.`);
            return;
        }

        let messageTracks = "";
        let indexMusic = 1;
        
        // Jumps are made two by two due to a discord-player error that returns the songs to you twice.
        for (let i = 0; i < queue.previousTracks.length - 1; i += 2) {
            messageTracks += indexMusic == 1 ? `${indexMusic}. ${queue.previousTracks[i].title}` : `\n${indexMusic}. ${queue.previousTracks[i].title}`;
            indexMusic++;
        }

        messageTracks += indexMusic == 1 ? `**${indexMusic}. ${queue.nowPlaying().title}**` : `\n**${indexMusic}. ${queue.nowPlaying().title}**`;
        indexMusic++;

        for (const track of queue.tracks) {
            messageTracks += indexMusic == 1 ? `${indexMusic}. ${track.title}` : `\n${indexMusic}. ${track.title}`;
            indexMusic++;
        }

        const embed = new MessageEmbed();
        embed.setTitle('Lista de reproducción');
        embed.setColor(message.guild.me.displayHexColor);
        embed.setDescription(messageTracks);

        await message.channel.send({embeds: [embed]});
    }

}