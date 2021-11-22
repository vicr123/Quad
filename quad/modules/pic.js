const handler = require("handler");

const t = str => str;

function pictureEmbed(user, t) {
    return {
        title: t("Profile Picture"),
        author: {
            name: user.tag,
            icon_url: user.avatarURL(),
            width: 512,
            height: 512
        },
        image: {
            url: user.avatarURL({dynamic: true, size: 2048})
        }
    }
}

handler.register("pic", {
    opts: {
        translatorRequired: true,
        description: t("Shows a profile picture")
    },
    args: [
        {name: "user", type: "user", description: t("The user to get the picture of"), optional: true}
    ],
}, async function(interaction, opts, args) {
	let user = args.user ?? interaction.user;
	interaction.reply({embeds: [pictureEmbed(user, opts.t)]});
});
