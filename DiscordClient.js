const { Client, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { ENV } = require("./Env.js");

/** @type {import("./stats/StatsBaseImpl.js").StatsGetter} */
const StatsGetter = ENV.implementation == null ? require("./stats/StatsBaseImpl.js") : require(
    ENV.implementation.startsWith("./") ? ENV.implementation : `./${ENV.implementation}`
);

/**
 * @typedef {{ id: Number, token: String, name: String }} Server
 * @typedef {{ client: Client, rest: REST, servers: Server[], serverIndex: Number }} ClientHolder
 */

/** @type {ClientHolder[]} */
let _Clients = [ ];

const UpdateRichPresence = async () => {
    for (const clientHolder of _Clients) {
        const client = clientHolder.client;

        const server = clientHolder.servers[clientHolder.serverIndex];
        clientHolder.serverIndex = (clientHolder.serverIndex + 1) % clientHolder.servers.length;

        const stats = await StatsGetter(server.id);
        if (stats == null) {
            client.user.setPresence({
                "activities": null,
                "status": "invisible",
                "afk": false
            });
        } else if (!stats.isOnline) {
            client.user.setPresence({
                "activities": [{
                    "type": "LISTENING",
                    "name": "for updates about the server (It's currently offline)."
                }],
                "status": "dnd",
                "afk": false
            });
        } else if (stats.onlinePlayers <= 0) {
            client.user.setPresence({
                "activities": [{
                    "type": "WATCHING",
                    "name": "for new players."
                }],
                "status": "idle",
                "afk": true
            });
        } else {
            client.user.setPresence({
                "activities": [{
                    "type": "PLAYING",
                    "name": `with ${stats.onlinePlayers}/${stats.playerCount} Players!`
                }],
                "status": "online",
                "afk": false
            });
        }
    }
};

// TODO: Implement Slash Commands
const _SlashCommands = [ ];

let _loggedIn = false;
const Login = async () => {
    if (_loggedIn) return false;

    const createdClients = { };
    for (const server of ENV.servers) {
        const token = server.token ?? ENV.fallbackToken;
        if (token == null) throw new Error("No valid fallback token was found.");

        if (createdClients[token] != null) {
            createdClients[token].servers.push(server);
            continue;
        }

        /** @type {ClientHolder} */
        const clientHolder = {
            "client": new Client({
                "intents": Intents.FLAGS.GUILD_PRESENCES
            }),
            "rest": new REST({ "version": "9" }).setToken(token),
            "servers": [ server ],
            "serverIndex": 0
        };

        clientHolder.client.token = token;
        clientHolder.client.once("ready", async () => {
            await clientHolder.rest.put(
                Routes.applicationCommands(
                    clientHolder.client.application.id
                ), { "body": _SlashCommands }
            );
        });

        _Clients.push(clientHolder);
        createdClients[token] = clientHolder;
    }

    for (const client of _Clients)
        await client.client.login();

    _loggedIn = true;
    return true;
};

const Destroy = () => {
    for (const clientHolder of _Clients) {
        clientHolder.client.destroy();
        clientHolder.rest.removeAllListeners();
    }
    _Clients = [ ];
    _loggedIn = false;
};

module.exports = {
    StatsGetter,
    UpdateRichPresence,
    Login, Destroy
};
