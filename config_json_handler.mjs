import fs from 'fs';
import path from 'path';
import util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const getConfigJsonPath = function () {
    return path.join(process.cwd(), "config.json");
}

const configJsonDataInitializedCheck = function () {
    if (!global.data.configJsonData) throw "data.configJsonData is not initialized";
}

const initializeAllGuildData = function(configJsonData) {
    configJsonData.data_of_guilds.forEach(dataOfGuild => {
        const defaultDataStructure = {
            "configuration_permission_roles": [],
            "settings": {}
        };
        assignData(dataOfGuild, defaultDataStructure);
    })
}

export const getDefaultGuildData = function(guildId) {
    return { "guild_id": guildId, "is_bot_activated": false, "configuration_permission_roles": [], "settings": {} };
}

export const initConfigJsonData = async function () {
    const configJsonPath = getConfigJsonPath();
    const configJsonFileReturn = await readFile(configJsonPath);
    const configJsonData = JSON.parse(configJsonFileReturn);
    global.data.configJsonData = configJsonData;

    initializeAllGuildData(configJsonData);

    setInterval(function () {
        const configJsonFileString = JSON.stringify(global.data.configJsonData);
        writeFile(configJsonPath, configJsonFileString).catch(e => { throw e });
    }, 1000);
}

export const getConfigJsonData = async function () {
    configJsonDataInitializedCheck();
    return global.data.configJsonData;
}

export const setConfigJsonData = async function (configJsonData) {
    configJsonDataInitializedCheck();
    global.data.configJsonData = configJsonData;
    return true;
}

export const getGuildIndex = function (data_of_guilds, guildId) {
    return data_of_guilds.map(e => { return e.guild_id; }).indexOf(guildId);
}

//param guildId <String> ギルドのID
//return guildData <object> | <undefined> ギルド情報を格納したオブジェクト。登録されていない場合、undefinedを返す。
export const getDataOfGuild = async function (guildId) {
    configJsonDataInitializedCheck();

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
//      guildData <Object>　ギルドオブジェクト
//return guildData <object> | <undefined> ギルド情報を格納したオブジェクト。登録されていない場合、undefinedを返す。
export const setDataOfGuild = async function (guildId, guildData) {

    configJsonDataInitializedCheck();

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
const assignData = function(targetData, data) {
    console.log(data);
    for (let key in data) {
        const isTargetObject = typeof targetData[key] === "object" && !targetData.isArray && targetData[key] !== null;
        const isSourceObject =  typeof data[key] === "object" && !data.isArray && data[key] !== null;
        if(isTargetObject && isSourceObject) assignData(targetData[key], data[key]);
        else if(isSourceObject) {
            targetData[key] = {};
            assignData(targetData[key], data[key]);
        }
        else targetData[key] = data[key];
    }
}

export const assignDataOfGuild = function (guildId, guildData) {
    configJsonDataInitializedCheck();

    const guildIndex = getGuildIndex(global.data.configJsonData.data_of_guilds, guildId);
    if (guildIndex === -1) {
        return;
    }

    assignData(global.data.configJsonData.data_of_guilds[guildIndex], guildData);
}