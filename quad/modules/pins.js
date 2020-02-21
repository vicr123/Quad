const handler = require("handler");
const config = require("config");
const db = require("db");
const log = require("log");

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

// Reactions
handler.on("botAvailable", () => {
    handler.bot.on("messageReactionAdd", async (message, emoji, userId) => {
        if (emoji.name !== config.get("bot.pins.emoji")) return;
        if (await pin(userId, message)) {
            message.channel.createMessage(`<@${userId}>, the message has been pinned!`);
        } else {
            message.channel.createMessage(`<@${userId}>, the message could not be pinned :(`);
        }
    });

    // userId will be the user who placed the reaction. This means that people with Manage Reactions
    // permissions can unpin messages for others.
    handler.bot.on("messageReactionRemove", async (message, emoji, userId) => {
        if (emoji.name !== config.get("bot.pins.emoji")) return;
        if (await unpin(userId, message)) {
            message.channel.createMessage(`<@${userId}>, the message has been unpinned!`);
        } else {
            message.channel.createMessage(`<@${userId}>, the message could not be unpinned :(`);
        }
    });

    // Don't listen to messageReactionRemoveAll so messages aren't always unpinned by moderators
});
