import { SlashCommandBuilder } from 'discord.js';
import { getConfigJsonRef, getGuildIndex, getDefaultGuildData } from "#app/config_json_handler.mjs"
import editReply from "#app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName('register_this_guild')
    .setDescription('このサーバーを登録します')
    .setDefaultMemberPermissions(0);

/** @param { import('discord.js').Interaction } interaction */
export const execute = async function (interaction) {
    try {
        await interaction.deferReply();
        const guild = interaction.guild;
        const configJsonData = getConfigJsonRef();
        if (!configJsonData) throw "no configJsonData";

        const guildIndex = getGuildIndex(configJsonData.data_of_guilds, guild.id);
        if (guildIndex !== -1) {
            await interaction.editReply("えーと、もう登録されてます");
            return;
        }
        const guildData = getDefaultGuildData(guild.id);
        configJsonData.data_of_guilds.push(guildData);
        await interaction.editReply("登録が完了しました！");
    } catch (e) {
        await editReply(interaction, "error_occured");
        return;
    }
}