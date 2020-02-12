const handler = require("handler");
const Eris = require("eris");
const moment = require("moment");

function getEmbed(user, t) {
    let params = {};
    
    let fields = [];
    let timestamps = [];
    timestamps.push(t("**Joined Discord** {{joindate, datetime}}", {
        joindate: {
            date: moment.utc(user.createdAt),
            user: user
        }
    }));
    if (user.guild) {
        timestamps.push(t("**Joined Server** {{joindate, datetime}}", {
            joindate: {
                date: moment.utc(user.joinedAt),
                user: user
            }
        }));
    }
    fields.push({
        name: t("Timestamps"),
        value: timestamps.join("\n")
    })
    
    let embed = {};
    embed.author = {
        name: `${user.username}#${user.discriminator}`,
        icon_url: user.staticAvatarUrl,
        proxy_icon_url: user.staticAvatarUrl
    };
    embed.title = t("User Information");
    embed.fields = fields;
    embed.footer = {
        text: t("User ID: {{userid}}", {userid: user.id})
    }
    return embed;
}

handler.register("uinfo", {
    opts: {
        translatorRequired: true
    }
}, function(message, opts) {
    message.channel.createMessage({
        embed: getEmbed(message.member, opts.t)
    });
});

handler.register("uinfo", {
    args: [
        {name: "user", type: "globaluser"}
    ],
    opts: {
        translatorRequired: true
    }
}, function(message, opts, args) {
    message.channel.createMessage({
        embed: getEmbed(args[0], opts.t)
    });
});