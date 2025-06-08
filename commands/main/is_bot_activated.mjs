import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import util from 'util';

import { getDataOfGuild } from '/app/config_json_handler.mjs';
import checkPermission from '/app/check_permission.mjs';
import editReply from "/app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName('is_bot_activated')
    .setDescription('メッセージへの反応が有効化されているか確認します');

export async function execute(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const guildData = await getDataOfGuild(guildId);
    if (guildData) {
        if (guildData.is_bot_activated) {
            await interaction.editReply("メッセージへの反応は有効です");
            return;
        } else {
            await interaction.editReply("メッセージへの反応は無効です");
        }

    } else {
        await editReply(interaction, "unregistered_guild");
    }
}