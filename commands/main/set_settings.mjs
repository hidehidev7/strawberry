import { SlashCommandBuilder } from 'discord.js';

import checkPermission from "#app/check_permission.mjs";
import editReply from "#app/editReply.mjs";
import { getDataOfGuild, assignDataOfGuild } from "#app/config_json_handler.mjs";

import { settings } from "#app/const.mjs";

export const data = (() => {
    let d = new SlashCommandBuilder()
        .setName("set_settings")
        .setDescription("Botの設定を行います");
    settings.forEach(setting => {
        if(!setting) return;
        const { id, description, type } = setting;
        d = d.addSubcommand(subcommand => {
            let s = subcommand.setName(id)
                .setDescription(description);
            const optionFunc = option => option.setName('value').setDescription('設定の値');
            if (type === "channel") {
                s = s.addChannelOption(optionFunc);
            }
            if (type === "string") {
                s = s.addStringOption(optionFunc);
            }
            return s;
        })
    })
    return d;
})();

export async function execute(interaction) {
    try {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const guildData = await getDataOfGuild(guildId);
        if (guildData) {
            const member = (() => {
                const memberCollection = interaction.guild.members.cache;
                return memberCollection.find(
                    (member) => member.user === interaction.user
                );
            })();
            const isAllowedToUseTheCommand = await checkPermission(member).catch(
                (e) => {
                    console.log(e);
                    return false;
                }
            );
            if (!isAllowedToUseTheCommand) {
                await editReply(interaction, "no_permission");
                return;
            }

            const settingId = interaction.options.getSubcommand();
            const settingData = settings.filter(setting => setting.id === settingId)[0];
            if(!settingData) throw "something unexpected happened!";
            const settingType = settingData.type;

            let value;
            if (settingType === "channel") {
                const raw = interaction.options.getChannel("value");
                value = raw ? raw.id : undefined;
            }
            if (settingType === "string") {
                value = interaction.options.getString("value") ?? undefined;
            }
            console.log(value);
            const newAssignData = { settings: {  } };
            newAssignData.settings[settingId] = value;
            assignDataOfGuild(guildId, newAssignData);
            await interaction.editReply(`設定[${settingId}]が更新されました！`);

        } else {
            await editReply(interaction, "unregistered_guild");
        }
    } catch (e) {
        console.error(e);
        await editReply(interaction, "error_occured");
    }
}