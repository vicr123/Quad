const handler = require("handler");
const config = require("config");
const db = require("db");
const log = require("log");
const eris = require("eris");

let bot;
let confirmationCache = [];

// Temporary translation function, will eventually be replaced with i18n module
const fakeT = (str, params) => {
    if (!params) return str;
    let res = str;
    for (key of Object.keys(params)) {
        res = res.replace(new RegExp("{{"+key+"}}", "g"), params[key]);
    }
    return res;
};

const getUserById = (userId) => bot.users.find(user => user.id === userId);

// Pinning and unpinning
const pin = async (userId, message) => {
    await db.getPool().query("INSERT INTO userPins(pinId, id, channel, message) VALUES(pinIdIncrement($1), $1, $2, $3)",
        [userId, message.channel.id, message.id])
        .catch(err => { return false; /* We don't care, message may have been pinned already */ });
    return true;
};

const unpin = async (userId, message) => {
    return await db.getPool().query("DELETE FROM userPins WHERE (id, channel, message) = ($1, $2, $3)",
        [userId, message.channel.id, message.id]).rowCount !== 0;
};

const unpinById = async (userId, pinId) => {
    return await db.getPool().query("DELETE FROM userPins WHERE (pinId, id) = ($1, $2)",
        [pinId, userId]).rowCount !== 0;
};

// Messages
const confirmPin = async (t, message, user) => {
    message = await message.channel.getMessage(message.id); // message argument isn't complete
    message.channel.createMessage({embed: {
        title: t("Done!"),
        description: t("The message has been pinned."),
        fields: [{
            name: message.author.username + "#" + message.author.discriminator,
            value: message.content || t("(No content)")
        }],
        footer: {
            text: t("{{USER}} pinned a message.", {"USER": message.author.username}),
            icon_url: user.dynamicAvatarURL(undefined, 128)
        }
    }}).then(confirmationMessage => {
        if (confirmationCache.length >= 500) { // TODO put this in config?
            confirmationCache.shift();
        }
        confirmationCache.push({userId: user.id, channelId: message.channel.id, messageId: message.id, confirmationMessageId: confirmationMessage.id});
        console.log(confirmationCache);
    });
};

// Reactions
handler.on("botAvailable", () => {
    bot = handler.bot;

    bot.on("messageReactionAdd", async (message, emoji, userId) => {
        if (emoji.name !== config.get("bot.pins.emoji")) return;

        let user = getUserById(userId);
        if (user.bot) return;

        if (await pin(userId, message)) {
            confirmPin(fakeT, message, user);
        } else {
            let t = fakeT;
            message.channel.createMessage(t("{{USER}}, the message could not be pinned.", {"USER": user.mention}));
        }
    });

    // userId will be the user who placed the reaction. This means that people with Manage Reactions
    // permissions can unpin messages for others.
    bot.on("messageReactionRemove", async (message, emoji, userId) => {
        if (emoji.name !== config.get("bot.pins.emoji")) return;

        let user = getUserById(userId);
        if (user.bot) return;

        if (await unpin(userId, message)) {
            let pos;
            for (i in confirmationCache) {
                console.log(i);
                let confirmation = confirmationCache[i];
                console.log(confirmation);
                if (confirmation.userId === userId &&
                    confirmation.channelId === message.channel.id &&
                    confirmation.messageId === message.id) {
                    console.log("weee");
                    message.channel.unsendMessage(confirmation.confirmationMessageId);
                    pos = i;
                    break;
                }
            }
            if (pos) confirmationCache.splice(pos, 1);
        } else {
            let t = fakeT;
            message.channel.createMessage(t("{{USER}}, the message could not be unpinned.", {"USER": user.mention}));
        }
    });

    // Don't listen to messageReactionRemoveAll so messages aren't always unpinned by moderators
});
