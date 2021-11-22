const handler = require("handler");
const config = require("config");

let t = str => str;

handler.register("ping", {
    opts: {
        translatorRequired: true,
        description: t("Checks to see if {{botname}} is working")
    }
}, async (interaction, opts) => {
	interaction.reply(opts.t("Pong!"));
});
