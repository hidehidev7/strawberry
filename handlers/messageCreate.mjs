import { setTimeout } from "node:timers/promises";
import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";

import { getDataOfGuild } from "/app/config_json_handler.mjs";

export default async (message) => {

    async function deleteSuperReportMessage() {

        const guildId = message.guildId;
        const guildData = await getDataOfGuild(guildId);

        if (!guildData) return;
        if (!guildData.is_bot_activated) return;

        if (message.content.match(/^\.(a|as|AS|A|e|eu|E|EU|n|na|NA|N|lagasia|nigsia)(| +.*)$/)) {
            await setTimeout(5 * 1000);
            await message.delete();
            console.log(`deleted a detected message　"${message.content}"`);
        }
    }

    await deleteSuperReportMessage();

    if (message.mentions.users.has(message.client.user.id)) {
        await message.reply("はい、ここにいます！");
    }
};
