const ratelimit = require("ratelimit");
const config = require("config");
const i18n = require("i18n");

const commandRatelimit = config.get("bot.ratelimit.commands");

module.exports = async function(interaction, actualOpts, opts, args) {
    //Check ratelimits
    let count = ratelimit.hit(interaction.user.id, config.get("bot.ratelimit.per"));
    if (count < commandRatelimit) {
        return true;
    } else if (count < commandRatelimit + 3) {
        let t = (await i18n(interaction.user)).t;
        interaction.reply({
			content: t("**Cool it, buddy!**\nYou're using {{botname}} too fast. You'll be able to use Quad again in **{{count, dp1}} seconds**.", {
            	botname: config.get("bot.name"),
            	count: ratelimit.timeout(interaction.user.id) / 1000
        	}),
			ephemeral: true
		});
        return false;
    } else {
        //Ignore the user now; they've been told enough
        return false;
    }
}
