
/**
 * @typedef {{
 *   isOnline: Boolean,
 *   playerCount: Number,
 *   onlinePlayers: Number,
 *   ping: Number|null
 * }} ServerStats
 */

/** @typedef {(serverId: Number) => Promise<ServerStats>} StatsGetter */

/** @type {StatsGetter} */
module.exports = async (serverId) => {
    return {
        "isOnline": false,
        "onlinePlayers": 0,
        "playerCount": 0,
        "ping": null
    };
};
