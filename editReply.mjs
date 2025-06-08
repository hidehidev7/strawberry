export default async function (interaction, replyCode) {
    const text = (() => {
        switch (replyCode) {
            case "no_permission":
                return "このコマンドを実行する権限がないみたいですよ";
            case "unregistered_guild":
                return "ちょっと待ってください、ギルドが登録されてないです！";
            case "error_occured":
                return "ごめんなさい、エラーが発生したみたいです。詳しいことは開発者に聞いて！";
            case "already_set":
                return "あれ、その内容はもう設定されているみたいです";
            default:
                return "えーっと……";
        }
    })();
    await interaction.editReply(text);
}
