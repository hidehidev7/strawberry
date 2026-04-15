import { SlashCommandBuilder } from "discord.js";

import { getGuildDataRef } from "#app/config_json_handler.mjs";
import checkPermission from "#app/check_permission.mjs";
import editReply from "#app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName("deactivate_bot")
    .setDescription("メッセージへの反応を無効にします");

export async function execute(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const guildDataRef = getGuildDataRef(guildId);
    if (guildDataRef) {
        const member = (() => {
            const memberCollection = interaction.guild.members.cache;
            return memberCollection.find(
                (member) => member.user === interaction.user
            );
        })();
        const isAllowedToUseTheCommand = await checkPermission(member);
        if (!isAllowedToUseTheCommand) {
            await editReply(interaction, "no_permission");
            return;
        }

        //実行権限あり
        if (!guildDataRef.is_bot_activated) {
            //Botが既に非アクティブである
            await editReply(interaction, "already_set");
            return;
        }
        guildDataRef.is_bot_activated = false;
        await interaction.editReply("メッセージへの反応が無効化されました！");
    } else {
        await editReply(interaction, "unregistered_guild");
    }
}
