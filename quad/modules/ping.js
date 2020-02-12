const handler = require("handler");
const config = require("config")

let t = str => str;

handler.register("ping", {
    opts: {
        translatorRequired: true,
        help: {
            description: t("Checks to see if {{botname}} is working")
        }
    }
}, function(message, opts) {
    message.channel.createMessage(opts.t("Ping!"));
});
