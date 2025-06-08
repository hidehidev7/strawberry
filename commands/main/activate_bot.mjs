import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import util from "util";

import { getDataOfGuild, setDataOfGuild } from "/app/config_json_handler.mjs";
import checkPermission from "/app/check_permission.mjs";
import editReply from "/app/editReply.mjs";

export const data = new SlashCommandBuilder()
    .setName("activate_bot")
    .setDescription("メッセージへの反応を有効にします");

export async function execute(interaction) {
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

        if (guildData.is_bot_activated) {
            await editReply(interaction, "already_set");
            return;
        }
        const editedGuildData = Object.assign({}, guildData);
        editedGuildData.is_bot_activated = true;
        const setDataOfGuildCheck = await setDataOfGuild(guildId, editedGuildData);
        if (setDataOfGuildCheck) {
            interaction.editReply("メッセージへの反応が有効化されました！");
        } else {
            await editReply(interaction, "error_occured");
        }
    } else {
        await editReply(interaction, "unregistered_guild");
    }
}
