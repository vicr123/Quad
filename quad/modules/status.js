const i18n = require("i18n");
const handler = require("handler");
const config = require("config");
const log = require("log");

const t = i18n.t;
let bot;

// 0: Playing
// 2: Listening to
// 3: Watching
const statuses = [
    [3, t("{{BOT_PREFIX}}help", {"BOT_PREFIX": config.get("bot.prefix")})],
    [3, t("you")],
    [0, t("Ski jacket shopping")],
    [3, t("Google Pay")],
    [0, t("with 🦆")],
    [2, t("Sent from my iPhone")],
    [0, t("Entertaining Mines")],
    [0, t("AlienEdit")],
    [0, t("Internet Explorer")]
];

const name = config.get("bot.name");
if (name === "Quad") {
    statuses.push([0, t("with {{BOT_NAME}}", {"BOT_NAME": "Tri"})]);
} else if (name === "Tri") {
    statuses.push([0, t("with {{BOT_NAME}}", {"BOT_NAME": "Quad"})]);
}

let currentStatus;
const updateStatus = async () => {
    log(t("Updating status"), log.debug);

    let newStatus;
    do {
        newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    } while (newStatus === currentStatus);
    currentStatus = newStatus;

    bot.editStatus("online", {type: currentStatus[0], name: currentStatus[1]});
    setTimeout(updateStatus, 120000);
}

handler.once("botAvailable", () => {
    bot = handler.bot;
    updateStatus();
});
