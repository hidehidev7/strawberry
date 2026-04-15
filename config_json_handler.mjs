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

//param guildId <String> ギルドのID
//return guildData <object> | <undefined> ギルド情報を格納したオブジェクト。登録されていない場合、undefinedを返す。
/** @return { GuildData | undefined } */
export const getDataOfGuild = function (guildId) {
    const configJsonData = global.data.configJsonData;
    if (!configJsonData) return;

    const guildIndex = getGuildIndex(configJsonData.data_of_guilds, guildId);
    if (guildIndex === -1) {
        return;
    }
    const guildData = configJsonData.data_of_guilds[guildIndex];
    const copyData = JSON.parse(JSON.stringify(guildData));
    return copyData;
}



//param guildId <String> ギルドのID
//      guildData <Object> ギルドオブジェクト
export const setDataOfGuild = function (guildId, guildData) {

    const guildIndex = getGuildIndex(global.data.configJsonData.data_of_guilds, guildId);
    if (guildIndex === -1) {
        return;
    }

    global.data.configJsonData.data_of_guilds[guildIndex] = JSON.parse(JSON.stringify(guildData));

    return true;
}

/**
* const targetData = {
    "john": 12,
    "michael": [1, 2, 3],
    "steve": {
        "a": 12,
        "b": "polite",
        "c": {}
    },
    "kate": null,
    "bill": () => console.log("hello")
}

const sourceData = {
    "john": 13,
    "michael": [3, 4, 5],
    "steve": {
        "a": 13,
        "c": 25,
        "d": "drive"
    },
    "kate": undefined,
    "bill": 654,
    "becky": { "a": "gna"}
}


assignData(targetData, sourceData);
sourceData.becky.a = "huji";
console.log(targetData); //expected output: {
    "john": 13,
    "michael": [3, 4, 5],
    "steve": {
        "a": 13,
        "b": "polite",
        "c": 25,
        "d": "drive"
    },
    "kate": undefined,
    "bill": 654,
    "becky": { "a": "gna"}
}

 * @param { object } targetData 
 * @param { object } data 
 */
const assignData = function (targetData, data) {
    for (let key in data) {
        const isTargetObject = typeof targetData[key] === "object" && !targetData.isArray && targetData[key] !== null;
        const isSourceObject = typeof data[key] === "object" && !data.isArray && data[key] !== null;
        if (isTargetObject && isSourceObject) assignData(targetData[key], data[key]);
        else if (isSourceObject) {
            targetData[key] = {};
            assignData(targetData[key], data[key]);
        }
        else targetData[key] = data[key];
    }
}

export const assignDataOfGuild = function (guildId, guildData) {
    const guildIndex = getGuildIndex(global.data.configJsonData.data_of_guilds, guildId);
    if (guildIndex === -1) {
        return;
    }

    assignData(global.data.configJsonData.data_of_guilds[guildIndex], guildData);
}