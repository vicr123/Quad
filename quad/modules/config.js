const handler = require("handler");
const config = require("config");


handler.register("config", {
    opts: {
        translatorRequired: true
    }
}, function(message, opts) {
    message.channel.createMessage(opts.t("**Configuration**\nTo configure {{botname}}, go ahead and visit {{link}}.", {
        botname: config.get("bot.name"),
        link: config.get("server.rootAddress")
    }));
});
