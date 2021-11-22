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
	{type: 3, name: t("you")},
	{type: 0, name: t("Ski jacket shopping")},
	{type: 3, name: t("Google Pay")},
	{type: 0, name: t("with 🦆")},
	{type: 2, name: t("Sent from my iPhone")},
	{type: 0, name: t("Entertaining Chess")}
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

	while (currentStatus === (currentStatus = Math.floor(Math.random() * statuses.length)));

    bot.user.setPresence({activities: [statuses[currentStatus]]});
    setTimeout(updateStatus, 120000);
}

handler.once("botAvailable", () => {
    bot = handler.bot;
	updateStatus();
});
