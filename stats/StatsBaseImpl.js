const fetch = require("node-fetch");
const { ENV } = require("../Env");

/**
 * @typedef {{
 *   isOnline: Boolean,
 *   playerCount: Number,
 *   onlinePlayers: Number,
 *   ping: Number|null
 * }} ServerStats
 * @typedef {{ token: String, id: Number, accountId: String, key: String, name: String }} Server
 */

/** @typedef {(server: Server) => Promise<ServerStats>} StatsGetter */

const _ServerStats = { };
let _lastUpdate = null;

/**
 * @param {Server} server
 */
const _UpdateStats = async (server) => {
    const now = Date.now();
    if (_lastUpdate != null && (_lastUpdate + ENV.apiThrottleInterval) > now)
        return;
    _lastUpdate = now;
    
    const accountId = server.accountId ?? ENV.accountId;
    const key = server.key ?? ENV.key;
    if (accountId == null) {
        console.log("No default accountId specified.");
        return;
    } else if (key == null) {
        console.log("No default key specified.");
        return;
    }

    const apiUrl = `https://api.scpslgame.com/serverinfo.php?id=${accountId}&key=${key}&online=true&players=true`;
    const resp = await fetch(apiUrl);
    if (resp.status !== 200) return;
    
    try {
        const jsonResponse = await resp.json();
        for (const serverStats of jsonResponse.Servers) {
            const [ onlinePlayers, playerCount ] = serverStats.Players.split("/");
            _ServerStats[serverStats.ID] = {
                "isOnline": serverStats.Online,
                "onlinePlayers": Number.parseInt(onlinePlayers),
                "playerCount": Number.parseInt(playerCount),
                "ping": null
            };
        }
    } catch (error) {
        console.log(`Error while retrieving stats:\n${error}`);
    }
};

/** @type {StatsGetter} */
module.exports = async (server) => {
    await _UpdateStats(server);
    return _ServerStats[server.id] ?? null;
};
