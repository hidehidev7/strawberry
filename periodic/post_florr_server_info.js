import { codeBlock, Client, EmbedBuilder } from "discord.js";
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

/** @typedef {Object.<string, Object.<string, string[]>>} ServersIdList */
/** @typedef {Object.<string, Object.<string, string>>} ServersId  */
export class PostFlorrServerInfoHandler {

    /** @type {ServersIdList} */ lastServers;

    numberOfRequestsSent;

    /** @param { Client } client */
    async do(client) {
        this.numberOfRequestsSent = 0;
        try {
            const servers = this.lastServers ? structuredClone(this.lastServers) : this.initServers();

            //check if previously got servers exist
            await this.removeServersNotExist(servers);

            //get new servers
            await this.fetchServers(servers);

            //check if it's different from last data
            if (this.lastServers && JSON.stringify(servers) === JSON.stringify(this.lastServers)) {
                return;
            }
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

            console.log(`sent ${this.numberOfRequestsSent} requests to florr.io`);
        } catch (e) {
            console.error(e);
            console.error("failed to post florr server info");
        }

    }

    /** @param {ServersIdList} servers */
    async removeServersNotExist(servers) {
        const promises = [];
        for (const region in servers) {
            for (const key in servers[region]) {
                const ids = servers[region][key];
                ids.forEach(id => {
                    const promise = fetch(`https://api.n.m28.io/server/${id}`)
                        .then(res => {
                            if (res.ok) { }
                            else {
                                const index = ids.indexOf(id);
                                if (index !== -1) ids.splice(index, 1);
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
        for(const region of ["NA", "EU", "AS"]) {
            servers[region] = {};
            for(const key in ENDPOINTS) {
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
                const ids = servers[region][key].slice();
                const id = datas[key].servers[vlutrkey].id;
                if (!ids.includes(id)) ids.push(id);

                servers[region][key] = ids.sort((a, b) => { return a.localeCompare(b) });
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

    /** @param { import("discord.js").Channel } channel */
    async post(channel, texts) {
        const colors = { NA: "#cc0000", EU: "#0000cc", AS: "#00aa00" };
        const messageOptions = [];
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
            messageOptions.push({ embeds: [embed] });
        }
        await Promise.all(messageOptions.map(option => channel.send(option)));
    }
}