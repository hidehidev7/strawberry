import { SlashCommandBuilder } from "discord.js";
import { getGuildDataRef } from "#app/config_json_handler.mjs";
import editReply from "#app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName("add_configuration_permission")
    .setDescription("設定を変更する権限を持つロールを追加します")
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
        guildDataRef.configuration_permission_roles.push(roleName);
        await interaction.editReply(`ロール"${roleName}"をリストに追加しました！`);
    } else {
        await editReply(interaction, "unregistered_guild");
    }
}
