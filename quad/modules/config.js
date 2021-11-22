const handler = require("handler");
const config = require("config");

const t = str => str;

handler.register("config", {
    opts: {
        translatorRequired: true,
		description: t("Get a link to configure {{botname}}")
    }
}, function(interaction, opts) {
    interaction.reply(opts.t("**Configuration**\nTo configure {{botname}}, go ahead and visit {{link}}.", {
        botname: config.get("bot.name"),
        link: config.get("server.rootAddress")
    }));
});
