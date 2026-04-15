import { getGuildDataRef } from '#app/config_json_handler.mjs';

export default async function (member) {
    if (!member) {
        throw ("error: the param 'member' is not vaild");
    }
    const guildId = member.guild.id;
    const guildDataRef = getGuildDataRef(guildId);

    if (!guildDataRef) return false;

    const rolesList = guildDataRef.configuration_permission_roles;

    return member.roles.cache.some(r => rolesList.includes(r.name));
}