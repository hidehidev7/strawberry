import { SlashCommandBuilder } from 'discord.js';

import editReply from "#app/editReply.mjs";
import { getDataOfGuild } from "#app/config_json_handler.mjs";

import { settings } from "#app/const.mjs";

export const data = (() => {
    let d = new SlashCommandBuilder()
        .setName("get_settings")
        .setDescription("Botの設定を確認します");
    settings.forEach(setting => {
        if (!setting) return;
        const { id, description } = setting;
        d = d.addSubcommand(subcommand => {
            let s = subcommand.setName(id)
                .setDescription(description);
            return s;
        });
    })
    d = d.addSubcommand(subcommand => subcommand.setName("all").setDescription("全ての設定項目を表示します"));
    return d;
})();

export async function execute(interaction) {
    try {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const guildData = await getDataOfGuild(guildId);
        if (guildData) {

            const settingId = interaction.options.getSubcommand();
            if (settingId === "all") await editReplyFullList(interaction, guildData);
            else await editReplyIndividually(interaction, guildData);
        } else {
            await editReply(interaction, "unregistered_guild");
        }
    } catch (e) {
        console.error(e);
        await editReply(interaction, "error_occured");
    }
}

async function editReplyIndividually(interaction, guildData) {
    const settingId = interaction.options.getSubcommand();

    let value = await getValue(interaction, settingId, guildData);

    await interaction.editReply(`設定[${settingId}]の値は[${value}]です`);
}

async function editReplyFullList(interaction, guildData) {
    let replyText = "設定項目 ... 説明 (現在の値)";
    for (let setting of settings) {
        const settingId = setting.id;

        let value = await getValue(interaction, settingId, guildData);

        replyText += `
${setting.id} ... ${setting.description} (${value})`;
    }
    await interaction.editReply(replyText);
}

async function getValue(interaction, settingId, guildData) {
    let value;
    const settingData = settings.filter(setting => setting.id === settingId)[0];
    if (!settingData) throw "something unexpected happened!";
    const settingType = settingData.type;
    if (settingType === "channel") {
        if (guildData.settings[settingId]) {
            const channel = await interaction.guild.channels.fetch(guildData.settings[settingId]);
            value = "#" + channel.name;
        } else {
            value = "未指定";
        }
    }
    return value;
}