import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import util from "util";

import { getDataOfGuild, setDataOfGuild } from "/app/config_json_handler.mjs";
import checkPermission from "/app/check_permission.mjs";
import editReply from "/app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName("delete_configuration_permission")
    .setDescription("設定を変更する権限を持つロールを削除します")
    .setDefaultMemberPermissions(0)
    .addStringOption(option =>
        option.setName('role')
            .setDescription('ロール名')
            .setRequired(true));

export async function execute(interaction) {
    await interaction.deferReply();
    const roleName = interaction.options.getString("role");

    const guildId = interaction.guild.id;
    const guildData = await getDataOfGuild(guildId);
    if (guildData) {

        const editedGuildData = Object.assign({}, guildData);
        const roleIndexInTheList = editedGuildData.configuration_permission_roles.indexOf(roleName);
        if (roleIndexInTheList === -1) {
            await interaction.editReply('指定された名前のロールは登録されていないようです');
            return;
        }
        editedGuildData.configuration_permission_roles.splice(roleIndexInTheList, 1);
        const setDataOfGuildCheck = await setDataOfGuild(guildId, editedGuildData);
        if (setDataOfGuildCheck) {
            await interaction.editReply(`ロール"${roleName}"をリストから削除しました！`);
        } else {
            await editReply(interaction, "error_occured");
        }
    } else {
        await editReply(interaction, "unregistered_guild");
    }
}
