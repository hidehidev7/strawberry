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

export const initConfigJsonData = async function () {
    const configJsonPath = getConfigJsonPath();
    const configJsonFileReturn = await readFile(configJsonPath);
    const configJsonData = JSON.parse(configJsonFileReturn);
    global.data.configJsonData = configJsonData;

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