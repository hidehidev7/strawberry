import { codeBlock, Client, EmbedBuilder } from "discord.js";
import { getConfigJsonData } from "#app/config_json_handler.mjs";

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

export class PostFlorrServerInfoHandler {

    lastServers;

    /** @param { Client } client */
    async do(client) {
        const configJsonData = getConfigJsonData();
        for (const dataOfGuild of configJsonData.data_of_guilds) {
            try {
                const channelId = dataOfGuild.settings.force_server_id_channel;
                if(!channelId) return;
                const channel = await client.channels.fetch(channelId);
                if(!channel) return;

                //get server info
                const servers = await this.fetchServers();

                //check if it's different from last data
                if (this.lastServers && JSON.stringify(servers) !== JSON.stringify(this.lastServers)) {
                    return;
                }
                const filteredServers = servers;
                this.lastServers = servers;

                //generate texts
                const texts = {};
                for (const region in filteredServers) {
                    texts[region] = {};
                    for (const key in servers[region]) {
                        texts[region][key] = codeBlock('js', `cp6.forceServerID("${servers[region][key]}")`);
                    }
                }

                //post data
                await this.post(channel, texts);
            } catch (e) {
                console.error(e);
                console.error("failed to post florr server info");
            }
        }
    }

    async fetchServers() {
        const servers = { NA: {}, EU: {}, AS: {} };
        for (const key in ENDPOINTS) {
            const data = await (await fetch(`https://api.n.m28.io/endpoint/${ENDPOINTS[key]}/findEach/`)).json();
            servers.NA[key] = data.servers["vultr-miami"].id;
            servers.EU[key] = data.servers["vultr-frankfurt"].id;
            servers.AS[key] = data.servers["vultr-tokyo"].id;
        }
        return servers;
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