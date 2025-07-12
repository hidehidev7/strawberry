import { SlashCommandBuilder } from 'discord.js';
import { getConfigJsonData, setConfigJsonData, getGuildIndex, getDefaultGuildData } from "#app/config_json_handler.mjs"
import editReply from "#app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName('register_this_guild')
    .setDescription('このサーバーを登録します')
    .setDefaultMemberPermissions(0);

export const execute = async function (interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;
    const configJsonData = await getConfigJsonData().catch(e => { console.log(e); });
    if (!configJsonData) {
        await editReply(interaction, "error_occured");
        return;
    }

    const guildIndex = getGuildIndex(configJsonData.data_of_guilds, guild.id);
    if (guildIndex !== -1) {
        await interaction.editReply("えーと、もう登録されてます");
        return;
    }

    const wConfigJsonData = Object.assign({}, configJsonData);
    const guildData = getDefaultGuildData(guild.id);
    wConfigJsonData.data_of_guilds.push(guildData);
    const check = await setConfigJsonData(wConfigJsonData).catch(e => { console.log(e); return "e"; });
    if (check === "e") {
        await editReply(interaction, "error_occured");
    } else {
        await interaction.editReply("登録が完了しました！");
    }
    return;
}