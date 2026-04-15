import { SlashCommandBuilder } from "discord.js";
import { getGuildDataRef } from "#app/config_json_handler.mjs";
import editReply from "#app/editReply.mjs";

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
    const guildDataRef = getGuildDataRef(guildId);
    if (guildDataRef) {
        if (!guildDataRef.configuration_permission_roles.includes(roleName)) {
            await interaction.editReply('指定された名前のロールは登録されていないようです');
            return;
        }
        const filtered = guildDataRef.configuration_permission_roles.filter(name => name !== roleName);
        guildDataRef.configuration_permission_roles = filtered;
        await interaction.editReply(`ロール"${roleName}"をリストから削除しました！`);
    } else {
        await editReply(interaction, "unregistered_guild");
    }
}
