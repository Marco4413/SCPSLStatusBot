const Client = require("./DiscordClient.js");
const { ENV } = require("./Env.js");

let _RP_INTERVAL_ID = null;

(async () => {
    await Client.Login();
    _RP_INTERVAL_ID = setInterval(
        Client.UpdateRichPresence,
        ENV.rpUpdateInterval
    );
})();

process.on("SIGINT", () => {
    clearInterval(_RP_INTERVAL_ID);
    Client.Destroy();
});
