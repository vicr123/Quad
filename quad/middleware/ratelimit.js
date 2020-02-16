const ratelimit = require("ratelimit");
const config = require("config");
const i18n = require("i18n");

const commandRatelimit = config.get("bot.ratelimit.commands");

module.exports = async function(message, opts, cmdOpts, args, flags) {
    //Check ratelimits
    let count = ratelimit.hit(message.author.id, config.get("bot.ratelimit.per"));
    if (count < commandRatelimit) {
        return true;
    } else if (count < commandRatelimit + 3) {
        let t = (await i18n(message.author)).t;
        message.channel.createMessage(t("**Cool it, buddy!**\nYou're using {{botname}} too fast. You'll be able to use Quad again in **{{count}} seconds**.", {
            botname: config.get("bot.name"),
            count: (ratelimit.timeout(message.author.id) / 1000).toFixed(1)
        }));
        return false;
    } else {
        //Ignore the user now; they've been told enough
        return false;
    }
}