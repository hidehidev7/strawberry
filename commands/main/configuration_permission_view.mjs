import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import util from 'util';

import { getDataOfGuild } from '/app/config_json_handler.mjs';
import editReply from "/app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName('view_configuration_permission')
    .setDescription('設定を変更する権限を持つロールを表示します');

export async function execute(interaction) {
    await interaction.deferReply();
    const guildId = interaction.guild.id;
    const guildData = await getDataOfGuild(guildId);
    if (guildData) {
        const c_p_roles = guildData.configuration_permission_roles;
        const replyText = c_p_roles.length === 0 ? "どうやら、設定権限を持つロールが設定されていませんね" : "Strawberryの設定権限を持つロールは" + c_p_roles.toString() + "です";
        await interaction.editReply(replyText);
    } else {
        await editReply(interaction, "unregistered_guild");
    }
}