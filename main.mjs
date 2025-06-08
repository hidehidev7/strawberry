import fs from "fs";
import path from "path";
import express from "express";
import discordjs from "discord.js";
const { Client, Collection, Events, GatewayIntentBits, ActivityType, EmbedBuilder, REST, Routes } = discordjs;
import CommandsRegister from "./regist-commands.mjs";



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
        const filePath = path.join(commandsPath, file);
        import(filePath).then((module) => {
            client.commands.set(module.data.name, module);
        });
    }
}

const handlers = new Map();

const handlersPath = path.join(process.cwd(), "handlers");
const handlerFiles = fs.readdirSync(handlersPath).filter((file) => file.endsWith(".mjs"));

for (const file of handlerFiles) {
    const filePath = path.join(handlersPath, file);
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