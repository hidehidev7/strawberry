import fs from 'fs';
import path from 'path';
import util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const getConfigJsonPath = function () {
    return path.join(process.cwd(), "config.json");
}

export const getConfigJsonData = async function () {
    const configJsonPath = getConfigJsonPath();
    const configJsonFileReturn = await readFile(configJsonPath).catch(e => { throw e; });
    const configJsonData = JSON.parse(configJsonFileReturn);
    return configJsonData;
}

export const setConfigJsonData = async function (configJsonData) {
    const configJsonPath = getConfigJsonPath();
    const configJsonFileReturn = JSON.stringify(configJsonData);
    const writeFileCheck = await writeFile(configJsonPath, configJsonFileReturn).catch(e => { throw e; });
    return true;
}

export const getGuildIndex = function (data_of_guilds, guildId) {
    return data_of_guilds.map(e => { return e.guild_id; }).indexOf(guildId);
}

//param guildId <String> ギルドのID
//return guildData <object> | <undefined> ギルド情報を格納したオブジェクト。登録されていない場合、undefinedを返す。
export const getDataOfGuild = async function (guildId) {
    const configJsonData = await getConfigJsonData().catch(e => { console.log(e); });
    if (!configJsonData) return;

    const guildIndex = getGuildIndex(configJsonData.data_of_guilds, guildId);
    if (guildIndex === -1) {
        return;
    }
    const guildData = configJsonData.data_of_guilds[guildIndex];
    return guildData;
}

//param guildId <String> ギルドのID
//      guildData <Object>　ギルドオブジェクト
//return guildData <object> | <undefined> ギルド情報を格納したオブジェクト。登録されていない場合、undefinedを返す。
export const setDataOfGuild = async function (guildId, guildData) {

    const configJsonData = await getConfigJsonData().catch(e => { console.log(e); });
    if (!configJsonData) return;

    const guildIndex = getGuildIndex(configJsonData.data_of_guilds, guildId);
    if (guildIndex === -1) {
        return;
    }

    const wConfigJsonData = Object.assign({}, configJsonData);
    wConfigJsonData.data_of_guilds[guildIndex] = guildData;
    return await setConfigJsonData(wConfigJsonData).catch(e => { console.log(e); });
}