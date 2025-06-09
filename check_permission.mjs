import fs from 'fs';
import path from 'path';
import util from 'util';

import { getDataOfGuild } from '#app/config_json_handler.mjs';

export default async function (member) {
    if (!member) {
        throw ("error: the param 'member' is not vaild");
    }
    const guildId = member.guild.id;
    const guildData = await getDataOfGuild(guildId);

    if (!guildData) return false;

    const rolesList = guildData.configuration_permission_roles;
    if (member.roles.cache.some(r => rolesList.includes(r.name))) {
        return true;
    } else {
        return false;
    }
}