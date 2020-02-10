const Eris = require('eris');
const config = require('config');
const i18n = require('i18n');
const log = require('log');
const handler = require('handler');
const modloader = require("./modloader");

const t = i18n.t;

log(t("Welcome to {{BOT_NAME}}!", {"BOT_NAME": config.get("bot.name")}));

modloader.init();

let bot = new Eris(config.get('bot.token'));
bot.on("ready", () => {
    log(t("Locked and loaded!"));
});
bot.on("messageCreate", (msg) => {
    if (msg.author.bot) return;
    
    if (msg.content.startsWith("quad:")) {
        handler.process("quad:", msg);
    }
});
bot.connect();