import fs from "fs";
import path from "path";
import CommandsRegister from "#app/regist-commands.mjs";
import discordjs from "discord.js";

const { Client, Collection, GatewayIntentBits } = discordjs;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

const categoryFoldersPath = path.join(process.cwd(), "commands");
const commandFolders = fs.readdirSync(categoryFoldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(categoryFoldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".mjs"));

    for (const file of commandFiles) {
        const filePath = "file://" + path.join(commandsPath, file);
        import(filePath).then((module) => {
            client.commands.set(module.data.name, module);
        });
    }
}

const handlers = new Map();

const handlersPath = path.join(process.cwd(), "handlers");
const handlerFiles = fs.readdirSync(handlersPath).filter((file) => file.endsWith(".mjs"));

for (const file of handlerFiles) {
    const filePath = "file://" + path.join(handlersPath, file);
    console.log(filePath);
    import(filePath).then((module) => {
        handlers.set(file.slice(0, -4), module);
    });
}

client.on("interactionCreate", async (interaction) => {
    await handlers.get("interactionCreate").default(interaction);
});

client.on("messageCreate", async (message) => {
    if (message.author.id == client.user.id || message.author.bot) return;
    await handlers.get("messageCreate").default(message);
});

client.on("ready", async () => {
    console.log(`${client.user.tag} がログインしました！`);
});

CommandsRegister({ updateForAllGuild: true, });
client.login(process.env.TOKEN);