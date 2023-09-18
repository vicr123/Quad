#!/usr/bin/env node

//Set up the configuration files
process.env["NODE_CONFIG_DIR"] = "/etc/quad/:../config/";
process.env["QUAD_TR_DIR"] = "./translations/";

const Eris = require('eris');
const config = require('config');
const i18n = require('i18n');
const log = require('log');
const handler = require('handler');
const modloader = require("./modloader");
const db = require("db");
const prefix = require("prefix");
require("./ctlsrv/server.js");
const {GuildChannel} = require("eris");

const t = i18n.t;
process.exitCode = 1; //Assume error unless otherwise proven

(async () => {
    log(t("Welcome to {{BOT_NAME}}!", {"BOT_NAME": config.get("bot.name")}));
    
    if (!await db.init(true)) throw new Error("Database Unavailable"); //Die if something happens when initialising the database
    modloader.init();
    handler.init();

    const Intents = Eris.Constants.Intents;
    const ERIS_OPTIONS = {intents: Intents.guilds | Intents.guildMembers | Intents.guildBans | Intents.guildMessages | Intents.guildMessageReactions};
    
    let bot = new Eris(config.get('discord.token'), ERIS_OPTIONS);
    bot.on("rawREST", rq => {
        log(`REST -> ${rq.method} ${rq.url}`, log.debug);
    });
    bot.on("ready", async () => {
		// Join all threads we can find
		let joins = [];
		bot.guilds.forEach(guild => {
			guild.threads.forEach((thr, id) => {
				joins.push(bot.joinThread(id));
			});
		});
		await Promise.all(joins);

        log(t("Locked and loaded!"), log.success);
    });

	bot.on("threadCreate", channel => bot.joinThread(channel.id));
	// When we can see new threads, simply try to join all threads
	bot.on("threadListSync", guild => {
		let joins = [];
		guild.threads.forEach((thr, id) => {
			joins.push(bot.joinThread(id));
		});
		return Promise.all(joins);
	});

    bot.on("messageCreate", async (msg) => {
        if (msg.author.bot) return;

        // Ignore DMs for now
        if (!(msg.channel instanceof GuildChannel)) return;
        
        let pf = await prefix(msg.channel.guild);
        if (msg.content.startsWith(pf) || pf === "") {
            handler.process(pf, msg);
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

    bot.connect();
    
    handler.setBot(bot);
})().then(retval => {
    
}).catch(err => {
    log(err.stack, log.error);
    handler.exit(false);
});
