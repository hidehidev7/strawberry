import { SlashCommandBuilder } from 'discord.js';

import { getGuildDataRef } from '#app/config_json_handler.mjs';
import editReply from "#app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName('is_bot_activated')
    .setDescription('メッセージへの反応が有効化されているか確認します');

export async function execute(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const guildDataRef = getGuildDataRef(guildId);
    if (guildDataRef) {
        if (guildDataRef.is_bot_activated) {
            await interaction.editReply("メッセージへの反応は有効です");
            return;
        } else {
            await interaction.editReply("メッセージへの反応は無効です");
        }

    } else {
        await editReply(interaction, "unregistered_guild");
    }
}