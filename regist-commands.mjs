import fs from 'fs';
import path from 'path';
import discordjs from 'discord.js';
const { REST, Routes } = discordjs;

const commands = [];
const foldersPath = path.join(process.cwd(), 'commands');
const commandFolders = fs.readdirSync(foldersPath);

export default async (options) => {
    const updateForAllGuild = options.updateForAllGuild;

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.mjs'));
        for (const file of commandFiles) {
            const filePath = "file://" + path.join(commandsPath, file);
            await import(filePath).then(module => {
                commands.push(module.data.toJSON());
            });
        }
    }

    const rest = new REST().setToken(process.env.TOKEN);

    (async () => {
        console.log(`[INIT] ${commands.length}つのスラッシュコマンドを更新します。`);

        if (updateForAllGuild) {
            console.log(process.env.APPLICATION_ID);
            const data = await rest.put(
                Routes.applicationCommands(process.env.APPLICATION_ID),
                { body: commands },
            );
        } else {
            const data = await rest.put(
                Routes.applicationCommands(process.env.APPLICATION_ID, process.env.HIDE_GUILD_ID),
                { body: commands },
            );
        }

        console.log(`[INIT] ${commands.length}つのスラッシュコマンドを更新しました。`);
    })();
};
