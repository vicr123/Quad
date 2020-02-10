const handler = require("handler");

handler.register("ping", {
    opts: {
        translatorRequired: true
    }
}, function(message, opts) {
    console.log(opts);
    message.channel.createMessage(opts.t("Ping!"));
});
