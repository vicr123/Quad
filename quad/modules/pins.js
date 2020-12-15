const handler = require("handler");
const config = require("config");
const db = require("db");
const i18n = require("i18n")

let bot;
let confirmationCache = [];

const getUserById = (userId) => bot.users.find(user => user.id === userId);

// Utilities
const formatMessage = (m, allowNsfw, t) => {
    let res = "";
    if (m.channel.nsfw && !allowNsfw) {
        res = t("(NSFW)");
    } else {
        // Attachments and embeds
        if (m.attachments.length > 0 && m.embeds.length === 0)
            res = t("({{ATTACHMENTS}} attachment(s))", {"ATTACHMENTS": m.attachments.length});
        else if (m.attachments.length === 0 && m.embeds.length > 0)
            res = t("({{EMBEDS}} embed(s))", {"EMBEDS": m.embeds.length});
        else if (m.attachments.length > 0 && m.embeds.length > 0)
            res = t("({{ATTACHMENTS}} attachment(s), {{EMBEDS}} embed(s))", {"ATTACHMENTS": m.attachments.length, "EMBEDS": m.embeds.length});

        if (m.content)
            res += "\n" + m.content;

        res += `\n— ${m.author.mention} ([${t("Jump")}](https://discordapp.com/channels/${m.channel.guild.id}/${m.channel.id}/${m.id}))`;
        // Messages must have contents, attachments, or embeds, so no need for a "No contents" case
    }
    return res;
}

// Pinning and unpinning
const pin = async (userId, message) => {
    await db.getPool().query("INSERT INTO userPins(pinId, id, channel, message) VALUES(pinIdIncrement($1), $1, $2, $3)",
        [userId, message.channel.id, message.id])
        .catch(() => { return false; /* We don't care, message may have been pinned already */ });
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
const confirmPin = async (message, user, channelOverride) => {
    message = await message.channel.getMessage(message.id); // message argument isn't complete
    let channel = (channelOverride || message.channel);

    const guildT = await i18n(channel.guild.id);
    const userT = await i18n(user);

    channel.createMessage({embed: {
        title: userT.t("Done!"),
        description: userT.t("The message has been pinned."),
        fields: [{
            name: message.author.username + "#" + message.author.discriminator,
            value: formatMessage(message, !channel.nsfw, userT.t)
        }],
        footer: {
            // Use guild translator instead of user's translator
            text: guildT.t("{{USER}} pinned a message.", {"USER": user.username}),
            icon_url: user.dynamicAvatarURL(undefined, 128)
        }
    }}).then(confirmationMessage => {
        if (confirmationCache.length >= 500) { // TODO put this in config?
            confirmationCache.shift();
        }
        confirmationCache.push({userId: user.id, channelId: message.channel.id, messageId: message.id, confirmationMessageId: confirmationMessage.id});
    });
};

// Reactions
handler.on("botAvailable", () => {
    bot = handler.bot;
});

handler.listen("messageReactionAdd", async (message, emoji, userId) => {
    if (emoji.name !== config.get("bot.pins.emoji")) return;

    let user = getUserById(userId);
    if (user.bot) return;

    if (await pin(userId, message)) {
        await confirmPin(message, user);
    } else {
        await message.channel.createMessage(i18n(user).t("{{USER}}, the message could not be pinned.", {"USER": user.mention}));
    }
});

// userId will be the user who placed the reaction. This means that people with Manage Reactions
// permissions can unpin messages for others.
handler.listen("messageReactionRemove", async (message, emoji, userId) => {
    if (emoji.name !== config.get("bot.pins.emoji")) return;

    let user = getUserById(userId);
    if (user.bot) return;

    if (await unpin(userId, message)) {
        let pos;
        for (let i in confirmationCache) {
            let confirmation = confirmationCache[i];
            if (confirmation.userId === userId &&
                confirmation.channelId === message.channel.id &&
                confirmation.messageId === message.id) {
                await message.channel.unsendMessage(confirmation.confirmationMessageId);
                pos = i;
                break;
            }
        }
        if (pos) confirmationCache.splice(pos, 1);
    } else {
        await message.channel.createMessage(i18n(user).t("{{USER}}, the message could not be unpinned.", {"USER": user.mention}));
    }
});

// Don't listen to messageReactionRemoveAll so messages aren't always unpinned by moderators

// Commands
const pageSize = 5;
let t = (string) => string; // fake translator
const handlePinsCommand = async (message, opts, args, flags) => {
    if (args[0] === undefined) args[0] = 1;
    if(args[0] < 1) {
        await message.channel.createMessage(opts.t("The page number can't 0 or less."));
        return;
    }

    let response = await message.channel.createMessage(opts.t("Loading your pins..."));

    let ascending = (flags.order || "d").startsWith("a");

    let parameters = [message.author.id];
    if (flags.category) parameters.push(flags.category);

    // Get the pins from the database
    let query;
    if (flags.category) {
        query = "SELECT p.* FROM userPins AS p, userPinsCategories AS pc, userCategories AS c WHERE p.id=pc.id AND p.id=c.id AND p.id=$1 AND p.pinid=pc.pinid AND pc.catid=c.catid AND c.name=$2 ORDER BY p.pinid " +
        (ascending ? "ASC" : "DESC");
    } else {
        query = "SELECT p.* FROM userPins AS p WHERE p.id=$1 ORDER BY p.pinid " +
        (ascending ? "ASC" : "DESC");
    }
    let result = await opts.db.query(query, parameters);
    
    // Find the page count
    let pageCount = Math.ceil(result.rows.length / pageSize);

    let offset = (args[0] - 1) * pageSize;
    let pins = result.rows.slice(offset, offset + pageSize);

	// Make sure we have pins
    if (pins.length === 0) {
        await response.edit(opts.t("{{USER}}, there are no results.", {"USER": message.author.mention}));
        return;
    }

    // Find categories for the results
    let promises = [];  
    for (let row of pins) {
        promises.push(opts.db.query("SELECT pinid, catid FROM userPinsCategories WHERE id=$1 AND pinid=$2", [message.author.id, row.pinid]));
    }
    
    let promises2 = [];
    let pinCategories = {};
    let categoryNames = {};
    for (let res of await Promise.all(promises)) { for (let row of res.rows) {
        pinCategories[row.pinid] = pinCategories[row.pinid] || [];
        pinCategories[row.pinid].push(row.catid);

        if (!Object.keys(categoryNames).includes(row.catid)) {
            promises2.push(opts.db.query("SELECT catid, name FROM userCategories WHERE id=$1 AND catid=$2", [message.author.id, row.catid]));
        }}
    }
    
    for (let res of await Promise.all(promises2)) {
        categoryNames[res.rows[0].catid] = res.rows[0].name;
    }
    
    // Get contents
    let pinFields = [];
    
    for (let row of pins) {
        let pMessage;
        let messageContent;
        try {
            pMessage = await handler.bot.getChannel(row.channel).getMessage(row.message);
            messageContent = formatMessage(pMessage, !pMessage.channel.nsfw, opts.t)
        } catch (e) {
            if (e.name !== "DiscordRESTError [10008]")
                throw e;
            messageContent = opts.t("(Deleted)");
        }
        pinFields.push({
            name: `#${row.pinid}` + (pinCategories[row.pinid] ? ` | ${pinCategories[row.pinid].map(value => categoryNames[value]).join(", ")}` : ""),
            value: messageContent
        });
    }

    const guildT = await i18n(message.channel.guild.id);

    await response.edit({content: "", embed: {
        title: opts.t("{{USER}}'s pins", {"USER": message.author.username}),
        fields: pinFields,
        footer: {
            // Use guild translator instead of user's translator
            text: guildT.t("{{USER}} is looking at their pins. [ {{PAGE}} / {{PAGES}} ]", {"USER": message.author.username, "PAGE": args[0], "PAGES": pageCount}),
            icon_url: message.author.dynamicAvatarURL(undefined, 128)
        }
    }});
};


handler.register("pins", {
    opts: {
        translatorRequired: true,
        dbRequired: true,
        help: {
            description: t("View your pinned messages")
        }
    },
    flags: [
        {name: "order", type: "string", description: t("The order to view pins in. Can be either `ascending` or `descending`.")},
        {name: "category", type: "string", description: t("The category to view pins from")}
    ]
}, handlePinsCommand);
handler.register("pins", {
    opts: {
        translatorRequired: true,
        dbRequired: true,
        help: {
            description: t("View your pinned messages")
        }
    },
    args: [{name: "page", type: "number", description: t("The page to view")}], // Number (instead of integer) because apparently, 1.5 would display the second half of page 1 and the first half of page 2
    flags: [
        {name: "order", type: "string", description: t("The order to view pins in. Can be either `ascending` or `descending`.")},
        {name: "category", type: "string", description: t("The category to view pins from")}
    ]
}, handlePinsCommand);

// Commands to pin
//   Pin by messages back into chat
handler.register("pin", {
    opts: {
        translatorRequired: true,
        help: {
            description: t("Pin the `n`th message back into the chat")
        }
    },
    args: [{name: "n", type: "integer", description: t("The number of messages back into the chat")}]
}, async (message, opts, args) => {
    const maxMessages = 20;
    
    if (args[0] < 1) {
        await message.channel.createMessage(opts.t("{{USER}}, `n` must be greater than 0.", {"USER": message.author.mention}));
        return;
    }
    if (args[0] > maxMessages) {
        await message.channel.createMessage(opts.t("{{USER}}, you can only pin up to {{maxMessages}} messages back into the chat! Please use a message link instead.", {"USER": message.author.mention, "maxMessages": maxMessages}));
        return;
    }
    let target = (await message.channel.getMessages(maxMessages, message.id))[args[0] - 1];
    
    if (await pin(message.author.id, target)) {
        await confirmPin(target, message.author);
    } else {
        await message.channel.createMessage(opts.t("{{USER}}, the message could not be pinned.", {"USER": message.author.mention}));
    }
});

//   Pin by link
handler.register("pin", {
    opts: {
        translatorRequired: true,
        help: {
            description: t("Pin the message using a link to it")
        }
    },
    args: [{name: "url", type: "string", description: t("The link to the message")}]
}, async (message, opts, args) => {
    let result = /https?:\/\/discord(?:app)?\.com\/channels\/\d+\/(\d+)\/(\d+)\/?/.exec(args[0]);
    
    let target;
    if (result && (target = await (handler.bot.getChannel(result[1]).getMessage(result[2]))) && await pin(message.author.id, target)) {
        await confirmPin(target, message.author, message.channel);
    } else {
        await message.channel.createMessage(opts.t("{{USER}}, the message could not be pinned.", {"USER": message.author.mention}));
    }
});
