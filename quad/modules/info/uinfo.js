const handler = require("handler");
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

const t = str => str;
handler.register("uinfo", {
    opts: {
        translatorRequired: true,
		description: t("Acquire information about a user")
    },
	args: [
		{name: "user", type: "user", description: t("The user to get information about"), optional: true}
	]
}, function(interaction, opts, args) {
	let user = args.user ?? interaction.user;
    interaction.reply({embeds: [
        getEmbed(user, opts.t)
    ]});
});
