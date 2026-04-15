import { JSONFilePreset } from "lowdb/node";

/**
 *  @typedef {{
 *      guild_id: string,
 *      is_bot_activated: boolean,
 *      configuration_permission_roles: string[],
 *      settings: Object<string, any>
 *  }} GuildData
 * */

/** @return { GuildData } */
export const getDefaultGuildData = function (guildId) {
    return { "guild_id": guildId, "is_bot_activated": false, "configuration_permission_roles": [], "settings": {} };
}

export const initConfigJsonData = async function () {
    const configJSONDB = await JSONFilePreset('./config.json', {"data_of_guilds": [] });
    global.data.configJsonData = configJSONDB.data;

    setInterval(async () => {
        await configJSONDB.write();
    }, 10_000);
}

export const getConfigJsonRef = function () {
    return global.data.configJsonData;
}

export const getGuildIndex = function (data_of_guilds, guildId) {
    return data_of_guilds.map(e => { return e.guild_id; }).indexOf(guildId);
}

export const getGuildDataRef = function (guildId) {
    const configJsonData = getConfigJsonRef();
    const guildIndex = getGuildIndex(configJsonData.data_of_guilds, guildId);
    if (guildIndex === -1) {
        return;
    }
    return configJsonData.data_of_guilds[guildIndex];
}