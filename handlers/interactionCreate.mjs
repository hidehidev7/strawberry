export default async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`「${interaction.commandName}」なんてコマンドはなさそうです。`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'コマンド実行中にエラーが発生しちゃいました……', ephemeral: true });
        } else {
            await interaction.reply({ content: 'コマンド実行中にエラーが発生しちゃいました……', ephemeral: true });
        }
    }
};
