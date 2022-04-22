const { Client, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { ENV } = require("./Env.js");
const StatsBase = require("./stats/StatsBaseImpl.js");
const Locale = require("./locale.json");
const { FormatString } = require("./Utils.js");

/** @type {StatsBase.StatsGetter} */
const StatsGetter = ENV.implementation == null ? require("./stats/StatsBaseImpl.js") : require(
    ENV.implementation.startsWith("./") ? ENV.implementation : `./${ENV.implementation}`
);

/** @typedef {{ client: Client, rest: REST, servers: StatsBase.Server[], serverIndex: Number }} ClientHolder */

/** @type {ClientHolder[]} */
let _Clients = [ ];

const UpdateRichPresence = async () => {
    for (const clientHolder of _Clients) {
        const client = clientHolder.client;

        const server = clientHolder.servers[clientHolder.serverIndex];
        clientHolder.serverIndex = (clientHolder.serverIndex + 1) % clientHolder.servers.length;

        const stats = await StatsGetter(server);
        let statsPresence;
        if (stats == null) {
            statsPresence = Locale.noStats;
        } else if (!stats.isOnline) {
            statsPresence = Locale.offline;
        } else if (stats.onlinePlayers <= 0) {
            statsPresence = Locale.noPlayers;
        } else {
            statsPresence = Locale.playerCount;
        }

        client.user.setPresence({
            "activities": [{
                "type": statsPresence.activity.type,
                "name": FormatString(
                    statsPresence.activity.name,
                    stats?.onlinePlayers ?? Locale.unknownNumber,
                    stats?.playerCount ?? Locale.unknownNumber,
                    stats?.ping ?? Locale.unknownNumber,
                    server.name
                )
            }],
            "status": statsPresence.status,
            "afk": statsPresence.status === "idle"
        });
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
