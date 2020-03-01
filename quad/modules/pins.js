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
const confirmPin = async (t, message, user, channelOverride) => {
    message = await message.channel.getMessage(message.id); // message argument isn't complete
    (channelOverride || message.channel).createMessage({embed: {
        title: t("Done!"),
        description: t("The message has been pinned."),
        fields: [{
            name: message.author.username + "#" + message.author.discriminator,
            value: message.content || t("(No content)")
        }],
        footer: {
            text: t("{{USER}} pinned a message.", {"USER": user.username}),
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
        confirmPin(fakeT, message, user);
    } else {
        let t = fakeT;
        message.channel.createMessage(t("{{USER}}, the message could not be pinned.", {"USER": user.mention}));
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
        for (i in confirmationCache) {
            let confirmation = confirmationCache[i];
            if (confirmation.userId === userId &&
                confirmation.channelId === message.channel.id &&
                confirmation.messageId === message.id) {
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

// Commands
const pageSize = 5;
let t = fakeT;
const handlePinsCommand = async (message, opts, args, flags) => {
    if (args[0] === undefined) args[0] = 1;
    if(args[0] < 1) {
        message.channel.createMessage(opts.t("The page number can't 0 or less."));
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
    
    // Make sure we have pins
    if (result.rowCount === 0) {
        response.edit(opts.t("{{USER}}, there are no results.", {"USER": message.author.mention}));
        return;
    }

    // Find the page count
    let pageCount = Math.ceil(result.rowCount / pageSize);

    let offset = (args[0] - 1) * pageSize;
    let pins = result.rows.slice(offset, offset + pageSize);
    //(args[0] - 1) * pageSize, pageSize
    
    // Find categories for the results
    let promises = [];  
    for (row of pins) {
        promises.push(opts.db.query("SELECT pinid, catid FROM userPinsCategories WHERE id=$1 AND pinid=$2", [message.author.id, row.pinid]));
    }
    
    let promises2 = [];
    let pinCategories = {};
    let categoryNames = {};
    for (res of await Promise.all(promises)) { for (row of res.rows) {
        pinCategories[row.pinid] = pinCategories[row.pinid] || [];
        pinCategories[row.pinid].push(row.catid);

        if (!Object.keys(categoryNames).includes(row.catid)) {
            promises2.push(opts.db.query("SELECT catid, name FROM userCategories WHERE id=$1 AND catid=$2", [message.author.id, row.catid]));
        }}
    }
    
    for (res of await Promise.all(promises2)) {
        categoryNames[res.rows[0].catid] = res.rows[0].name;
    }
    
    // Get contents
    let pinFields = [];
    
    for (row of pins) {
        let message = await handler.bot.getChannel(row.channel).getMessage(row.message);
        pinFields.push({
            name: `#${row.pinid}` + (pinCategories[row.pinid] ? ` | ${pinCategories[row.pinid].map(value => categoryNames[value]).join(", ")}` : ""),
            value: `${message.content}
                    — ${message.author.mention} ([Jump](https://discordapp.com/channels/${message.channel.guild.id}/${row.channel}/${row.message}))`
        });
    }

    response.edit({content: "", embed: {
        title: opts.t("{{USER}}'s pins", {"USER": message.author.username}),
        fields: pinFields,
        footer: {
            text: t("{{USER}} is looking at their pins. | Page {{PAGE}} of {{PAGES}}", {"USER": message.author.username, "PAGE": args[0], "PAGES": pageCount}),
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
    args: [{name: "n", type: "integer", description: t("The amount of messages back into the chat, or a the message id")}]
}, async (message, opts, args, flags) => {
    const maxMessages = 20;
    
    if (args[0] < 1) {
        message.channel.createMessage(opts.t("{{USER}}, `n` must be greater than 0.", {"USER": message.author.mention}));
        return;
    }
    if (args[0] > maxMessages) {
        message.channel.createMessage(opts.t("{{USER}}, you can only pin up to {{maxMessages}} messages back into the chat! Please use a message link instead.", {"USER": message.author.mention, "maxMessages": maxMessages}));
        return;
    }
    let target = (await message.channel.getMessages(maxMessages, message.id))[args[0] - 1];
    
    if (await pin(message.author.id, target)) {
        confirmPin(opts.t, target, message.author);
    } else {
        message.channel.createMessage(opts.t("{{USER}}, the message could not be pinned.", {"USER": message.author.mention}));
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
}, async (message, opts, args, flags) => {
    let result = /https?\:\/\/discordapp\.com\/channels\/\d+\/(\d+)\/(\d+)\/?/.exec(args[0]);
    
    let target;
    if (result && (target = await (handler.bot.getChannel(result[1]).getMessage(result[2]))) && await pin(message.author.id, target)) {
        confirmPin(opts.t, target, message.author, message.channel);
    } else {
        message.channel.createMessage(opts.t("{{USER}}, the message could not be pinned.", {"USER": message.author.mention}));
        return;
    }
});
