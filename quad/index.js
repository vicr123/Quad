#!/usr/bin/env node

//Set up the configuration files
process.env["NODE_CONFIG_DIR"] = "/etc/quad/:../config/";
process.env["QUAD_TR_DIR"] = "./translations/";

const {Client, Intents} = require('discord.js');
const config = require('config');
const i18n = require('i18n');
const log = require('log');
const handler = require('handler');
const modloader = require("./modloader");
const db = require("db");
require("./ctlsrv/server.js");

const t = i18n.t;
process.exitCode = 1; //Assume error unless otherwise proven

(async () => {
    log(t("Welcome to {{BOT_NAME}}!", {"BOT_NAME": config.get("bot.name")}));
    
    if (!await db.init(true)) throw new Error("Database Unavailable"); //Die if something happens when initialising the database
    modloader.init();
    handler.init();

	if (!process.argv.slice(2).includes("--nopushcommands")) handler.pushCommands();

    let bot = new Client({intents: [Intents.FLAGS.GUILDS]});
    bot.once("ready", () => {
        log(t("Locked and loaded!"), log.success);
    });

	bot.on("interactionCreate", async interaction => {
        if (interaction.isCommand()) {
            handler.processCommand(interaction);
        }
		else {
			log(t("Unknown interaction received!"), log.debug);
		}
	});

    process.on("SIGINT", () => {
        console.log(); // Make text appear on line after ^C
        handler.exit();
    });
    process.on("SIGTERM", () => {
        console.log(); // Make text appear on line after ^C
        handler.exit();
    });

    bot.login(config.get('discord.token'))

    handler.setBot(bot);
})().then(retval => {
    
}).catch(err => {
    log(err.stack, log.error);
    handler.exit(false);
});
