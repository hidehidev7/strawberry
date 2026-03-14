export const settings = [
    {
        id: "log_channel",
        description: "ログを表示するチャンネル。無指定でログを出力しません",
        type: "channel"
    },
    {
        id: "squad_allowed_channel_s",
        description: "/squadを許可するチャンネル名を半角スペース区切りで列挙",
        type: "string"
    },
    {
        id: "force_server_id_channel",
        description: "florr.ioのサーバーを指定するコードを表示するチャンネル。無指定で出力しません",
        type: "channel"
    }
];