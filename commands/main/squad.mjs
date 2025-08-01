import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, hyperlink, MessageFlags, SlashCommandBuilder, userMention } from "discord.js";
import editReply from "#app/editReply.mjs";
import { getDataOfGuild } from "#app/config_json_handler.mjs";

export const data = new SlashCommandBuilder()
    .setName("squad")
    .setDescription("スクアドコードを表示")
    .addStringOption(option =>
        option.setName('code')
            .setDescription('スクアドコード')
            .setRequired(true)
    )
    .addUserOption(option =>
        option.setName('black1')
            .setDescription('表示を許可しないユーザー')
    )
    .addUserOption(option =>
        option.setName('black2')
            .setDescription('表示を許可しないユーザー')
    )
    .addUserOption(option =>
        option.setName('black3')
            .setDescription('表示を許可しないユーザー')
    )
    .addUserOption(option =>
        option.setName('black4')
            .setDescription('表示を許可しないユーザー')
    )
    .addUserOption(option =>
        option.setName('black5')
            .setDescription('表示を許可しないユーザー')
    );

export async function execute(interaction) {
    try {
        const replyMessage = (await interaction.deferReply({ withResponse: true })).resource.message;

        const dataOfGuild = await getDataOfGuild(interaction.guild.id);
        if (!dataOfGuild) {
            await editReply(interaction, "unregistered_guild");
            return;
        }
        {
            const squadAllowedChannelStr = dataOfGuild.settings.squad_allowed_channel_s ?? "";
            const squadAllowedChannelList = squadAllowedChannelStr.split(" ");
            console.log(squadAllowedChannelList);
            if (!squadAllowedChannelList.includes(replyMessage.channel.name)) {
                await editReply(interaction, "not_allowed_here");
                return;
            }
        }

        const logChannel = await interaction.guild.channels.fetch(dataOfGuild.settings.log_channel);

        const codeString = interaction.options.getString('code');

        const blacklistUsers = [];
        blacklistUsers.push(interaction.options.getUser("black1"));
        blacklistUsers.push(interaction.options.getUser("black2"));
        blacklistUsers.push(interaction.options.getUser("black3"));
        blacklistUsers.push(interaction.options.getUser("black4"));
        blacklistUsers.push(interaction.options.getUser("black5"));

        const button = new ButtonBuilder()
            .setCustomId('button')
            .setLabel('スクアドコード')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const firstMessage = await replyMessage.channel.send({
            components: [row],
            withResponse: true
        });
        console.log(firstMessage);

        const collector = firstMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
        collector.on("collect", async i => {
            if (blacklistUsers.includes(i.user)) {
                await i.reply({
                    content: "募集者によって指定されているので、あなたはこのスクアドコードを閲覧することができません！ :P",
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await i.reply({
                    content: `スクアドコード： ${codeString}`,
                    flags: MessageFlags.Ephemeral
                });
                if (dataOfGuild.settings.log_channel && logChannel) {
                    await logChannel.send(`Squad Button Click: ${userMention(i.user.id)} clicked button ${firstMessage.id} ${firstMessage.url}`);
                }
            }
        });

        await interaction.deleteReply();

        //log
        if (dataOfGuild.settings.log_channel && logChannel) {
            await logChannel.send(`Squad Button Create: ${userMention(interaction.user.id)} created button ${firstMessage.id} ${firstMessage.url}
`);
        }

    } catch (e) {
        console.log(e);
        await editReply(interaction, "error_occured");
    }
}