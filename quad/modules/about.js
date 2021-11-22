const handler = require("handler");
const config = require("config");

let t = str => str;

handler.register("about", {
    opts: {
        translatorRequired: true,
        description: t("Shows information about {{botname}}")
    }
}, function(interaction, opts, args) {
	interaction.reply({embeds: [{
            description: opts.t("Discord Bot"),
            author: {
                name: `${config.get("bot.name")} ${config.get("bot.version")}`,
                icon_url: handler.bot.user.avatarURL
            },
            fields: [
                {
                    name: opts.t("Settings"),
                    value: opts.t("Change {{botname}} at the [website]({{website}}).", {
                        botname: config.get("bot.name"),
                        website: config.get("server.rootAddress")
                    })
                },
                {
                    name: opts.t("File a bug"),
                    value: opts.t("File a bug at the [{{gitservice}} Repository]({{repository}}) for {{botname}}.", {
                        gitservice: config.get("bot.about.gitservice"),
                        repository: `${config.get("bot.repo")}/issues`,
                        botname: config.get("bot.name")
                    })
                },
                {
                    name: opts.t("Source"),
                    value: opts.t("Source code for {{botname}} is available at the [{{gitservice}} Repository]({{repository}}), licensed under the GNU General Public License.", {
                        gitservice: config.get("bot.about.gitservice"),
                        repository: config.get("bot.repo"),
                        botname: config.get("bot.name")
                    })
                },
                {
                    name: opts.t("Contributors"),
                    value: `${opts.t("{{botname}} is possible due to the work of these wonderful people:", {
                        botname: config.get("bot.name")
                    })}\n${config.get("bot.about.contributors").join("\n")}`
                }
            ],
            footer: {
                text: opts.t("{{botname}} {{botver}}. Thanks for using {{botname}}!", {
                    botname: config.get("bot.name"),
                    botver: config.get("bot.version")
                })
            }
        }
	]});
});
