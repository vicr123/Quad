const handler = require("handler");
const db = require("db");
const i18n = require("i18n")

handler.listen("guildMemberAdd", async (guild, member) => {
	const username = member.username;

	let res = await db.getPool().query("SELECT pattern FROM guildAutobans WHERE id = $1", [guild.id]);

	for (let row of res.rows) {
		if (username.toLowerCase().includes(row.pattern)) { // pattern is always lowercase
			await guild.banMember(member.id, 1, (await i18n(guild.id)).t(
				"Autoban: name contains {{PATTERN}}.",
				{"PATTERN": row.pattern}));
			break;
		}
	}
});

// Fake translator
const t = (s) => s;

handler.register("autoban", {
	opts: {
		translatorRequired: true,
		dbRequired: true,
		help: {
			description: t("Ban all users with a username containing the given string")
		},
		permissionsRequired: ["administrator", "banMembers"]
	},
	args: [
		{name: "pattern", type: "string", description: t("The pattern to look for")}
	]
}, async (message, opts, args, flags) => {
	try {
		await opts.db.query("INSERT INTO guildAutobans (id, pattern) VALUES ($1, $2)",
			[message.channel.guild.id, args[0].toLowerCase()]);
		
		message.channel.createMessage({embed: {
			title: opts.t("Autoban a pattern"),
			description: opts.t("Users with `{{PATTERN}}` in their username will no be banned automatically from now on.", {"PATTERN": args[0].toLowerCase()})
		}});
	} catch (e) {
		message.channel.createMessage({embed: {
			title: opts.t("Autoban a pattern"),
			description: opts.t("Something went wrong. Are you sure this pattern hasn't been banned yet?")
		}});
	}
});

handler.register("unautoban", {
	opts: {
		translatorRequired: true,
		dbRequired: true,
		help: {
			description: t("No longer ban all users with a username containing the given string")
		},
		permissionsRequired: ["administrator", "banMembers"]
	},
	args: [
		{name: "pattern", type: "string", description: t("A currently autobanned pattern")}
	]
}, async (message, opts, args, flags) => {
	try {
		let res = await opts.db.query("DELETE FROM guildAutobans WHERE (id, pattern) = ($1, $2)",
			[message.channel.guild.id, args[0].toLowerCase()]);
		
		message.channel.createMessage({embed: {
			title: opts.t("Unautoban a pattern"),
			description: res.rowCount > 0 ? opts.t("Users with `{{PATTERN}}` in their username will no longer be banned.", {"PATTERN": args[0].toLowerCase()})
			: opts.t("That pattern wasn't banned. Are you sure you spelled it right?")
		}});
	} catch (e) {
		message.channel.createMessage("Something went wrong.");
	}
});

handler.register("autobans", {
	opts: {
		translatorRequired: true,
		dbRequired: true,
		help: {
			description: t("List all username patterns that are autobanned")
		},
		permissionsRequired: ["administrator", "banMembers"]
	}
}, async (message, opts, args, flags) => {
	let res = await db.getPool().query("SELECT pattern FROM guildAutobans WHERE id = $1", [message.channel.guild.id]);
	let patterns = [];

	for (let row of res.rows) {
		patterns.push(row.pattern);
	}

	message.channel.createMessage({embed: {
		title: opts.t("Autobans"),
		description: patterns.length > 0 ? opts.t("The following username patterns are autobanned: {{PATTERNS}}", {"PATTERNS": "`" + patterns.join("`, `") + "`."})
		: opts.t("There are currently no autobanned username patterns.")
	}});
});
