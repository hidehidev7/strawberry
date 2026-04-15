import { codeBlock, Client, EmbedBuilder, TextChannel } from "discord.js";
import { getConfigJsonRef } from "#app/config_json_handler.mjs";

const ENDPOINTS = {
    garden: "florrio-map-0-green",
    desert: "florrio-map-1-green",
    ocean: "florrio-map-2-green",
    jungle: "florrio-map-3-green",
    ant_hell: "florrio-map-4-green",
    hel: "florrio-map-5-green",
    sewers: "florrio-map-6-green",
    factory: "florrio-map-7-green",
    pyramid: "florrio-map-8-green"
};

const BEGINNING_CONTENT = "<Strawberry Server Codes Message>";

/** @typedef {Object.<string, Object.<string, string[]>>} ServersIdList */
/** @typedef {Object.<string, Object.<string, string>>} ServersId  */
export class PostFlorrServerInfoHandler {

    /** @type {ServersIdList} */ lastServers;

    numberOfRequestsSent;

    /** @param { Client } client */
    async do(client) {
        this.numberOfRequestsSent = 0;
        try {
            const servers = this.initServers();

            //get new servers
            await this.fetchServers(servers);

            //check if previously got servers exist
            await this.removeServersNotExist(this.lastServers, servers);

            //sort for comparision
            this.sortServers(servers);

            //check if it's different from last data
            if (!this.lastServers || JSON.stringify(servers) !== JSON.stringify(this.lastServers)) {
                this.lastServers = servers;
                const filteredServers = servers;

                //generate texts
                const texts = {};
                for (const region in filteredServers) {
                    texts[region] = {};
                    for (const key in servers[region]) {
                        texts[region][key] = servers[region][key].map(id => {
                            return codeBlock('js', `cp6.forceServerID("${id}")`);
                        }).join("");
                    }
                }

                //post data
                const configJsonData = getConfigJsonRef();
                for (const dataOfGuild of configJsonData.data_of_guilds) {
                    const channelId = dataOfGuild.settings.force_server_id_channel;
                    if (channelId) {
                        const channel = await client.channels.fetch(channelId);
                        if (channel) {
                            await this.post(channel, texts);
                        }
                    }
                }
            }

            console.log(`sent ${this.numberOfRequestsSent} requests to florr.io`);

        } catch (e) {
            console.error(e);
            console.error("failed to post florr server info");
        }
    }

    /** @param {ServersIdList} cachedServers @param {ServersIdList} verifiedServers changes will be comitted this obj */
    async removeServersNotExist(cachedServers, verifiedServers) {
        const promises = [];
        for (const region in cachedServers) {
            for (const key in cachedServers[region]) {
                const cachedIds = cachedServers[region][key];
                const verifiedIds = verifiedServers[region][key];
                cachedIds.forEach(cachedId => {
                    if (verifiedIds.includes(cachedId)) return;

                    const promise = fetch(`https://api.n.m28.io/server/${cachedId}`)
                        .then(res => {
                            if (res.ok) {
                                verifiedIds.push(cachedId);
                            }
                        });
                    promises.push(promise);
                    this.numberOfRequestsSent++;
                });
            }
        }
        await Promise.all(promises);
    }

    initServers(servers = {}) {
        for (const region of ["NA", "EU", "AS"]) {
            servers[region] = {};
            for (const key in ENDPOINTS) {
                servers[region][key] = [];
            }
        }
        return servers;
    }

    /** @param {ServersIdList} servers */
    async fetchServers(servers) {
        const regions = Object.keys(servers);

        const fetchPromises = [];
        const datas = {};
        for (const key in ENDPOINTS) {
            const fetchPromise = fetch(`https://api.n.m28.io/endpoint/${ENDPOINTS[key]}/findEach/`)
                .then(res => res.json())
                .then(data => { datas[key] = data; });
            fetchPromises.push(fetchPromise);
            this.numberOfRequestsSent++;
        }

        await Promise.all(fetchPromises);

        for (const region of regions) {
            const vlutrkey = { NA: "vultr-miami", EU: "vultr-frankfurt", AS: "vultr-tokyo" }[region];
            for (const key in datas) {
                const ids = servers[region][key];
                const id = datas[key].servers[vlutrkey].id;
                if (!ids.includes(id)) ids.push(id);
            }
        }
    }

    /** @param {ServersIdList} servers */
    sortServers(servers) {
        for (const region in servers) {
            for (const key in servers[region]) {
                servers[region][key] = servers[region][key].sort((a, b) => { return a.localeCompare(b) });
            }
        }
    }

    filterUnchangedServers(servers) {
        const verified = {};
        for (const region in servers) {
            if (!this.lastServers || JSON.stringify(servers[region]) !== JSON.stringify(this.lastServers[region])) {
                verified[region] = servers[region];
            }
        }
        return verified;
    }

    /** @param { TextChannel } channel */
    async post(channel, texts) {
        const colors = { NA: "#cc0000", EU: "#0000cc", AS: "#00aa00" };
        const embeds = [];
        for (const region in texts) {
            const embed = new EmbedBuilder()
                .setColor(colors[region])
                .setTitle(region)
                .addFields(
                    { name: 'Garden', inline: true, value: texts[region].garden },
                    { name: 'Desert', inline: true, value: texts[region].desert },
                    { name: 'Ocean', inline: true, value: texts[region].ocean }
                )
                .addFields(
                    { name: 'Jungle', inline: true, value: texts[region].jungle },
                    { name: 'Ant Hell', inline: true, value: texts[region].ant_hell },
                    { name: 'Hel', inline: true, value: texts[region].hel }
                )
                .addFields(
                    { name: 'Sewers', inline: true, value: texts[region].sewers },
                    { name: 'Factory', inline: true, value: texts[region].factory },
                    { name: 'Pyramid', inline: true, value: texts[region].pyramid }
                );
            embeds.push(embed);
        }

        const messageOption = { content: BEGINNING_CONTENT, embeds };
        if (channel.lastMessage && channel.lastMessage.content === BEGINNING_CONTENT) {
            await channel.lastMessage.edit(messageOption);
        } else {
            await channel.send(messageOption);
        }
    }
}