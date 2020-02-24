const handler = require("handler");
const MemberUtils = require("memberutils");

const t = str => str;

function pictureEmbed(user, t) {
    return {
        title: t("Profile Picture"),
        author: {
            name: MemberUtils.tag(user),
            icon_url: user.avatarURL,
            width: 512,
            height: 512
        },
        image: {
            url: user.avatarURL.replace("size=128", "size=2048")
        }
    }
}

handler.register("pic", {
    opts: {
        translatorRequired: true,
        help: {
            description: t("Shows your profile picture")
        }
    }
}, async function(message, opts, args, flags) {
    message.channel.createMessage({
        embed: pictureEmbed(message.author, opts.t)
    })
});

handler.register("pic", {
    args: [
        {name: "user", type: "globaluser", description: t("The user to get the picture of")}
    ],
    opts: {
        translatorRequired: true,
        help: {
            description: t("Shows a user's profile picture")
        }
    }
}, async function(message, opts, args, flags) {
    message.channel.createMessage({
        embed: pictureEmbed(args[0], opts.t)
    })
});

handler.link("picture", "pic");
handler.link("profilepicture", "pic");
handler.link("profilepic", "pic");
handler.link("pfp", "pic");
handler.link("avatar", "pic");
