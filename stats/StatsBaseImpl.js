
/**
 * @typedef {{
 *   isOnline: Boolean,
 *   playerCount: Number,
 *   onlinePlayers: Number,
 *   ping: Number|null
 * }} ServerStats
 * @typedef {{ token: String, id: Number, key: String, name: String }} Server
 */

/** @typedef {(server: Server) => Promise<ServerStats>} StatsGetter */

/** @type {StatsGetter} */
module.exports = async (server) => {
    return {
        "isOnline": false,
        "onlinePlayers": 0,
        "playerCount": 0,
        "ping": null
    };
};
