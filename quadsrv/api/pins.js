const express = require('express');
const db = require('db');
const bot = require("bot");
const { response } = require('express');

let router = express.Router();
module.exports = router;

router.get("/", async (req, res) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }

    let client = await db.get();
    try {
        let response = await client.query("SELECT pinid FROM userpins WHERE id=$1", [req.user.id]);
        res.send(response.rows.map(row => row.pinid));
    } catch (error) {
        res.sendStatus(500);
    } finally {
        client.release();
    }

});

router.get("/:pinid", async (req, res) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }

    let client = await db.get();
    try {
        let response = await client.query("SELECT * FROM userpins WHERE id=$1 AND pinid=$2", [req.user.id, req.params.pinid]);
        if (response.rowCount === 0) {
            res.sendStatus(404);
            return;
        }

        let data = response.rows[0];
        try {
            let channel = bot.getChannel(data.channel);

            let message = channel.messages.find(message => {
                return message.id === data.message
            });
            if (!message) message = await channel.getMessage(data.message);

            channel.messages.add(message);

            let reply = {
                id: req.params.pinid,
                content: message.content,
                author: `${message.author.username}#${message.author.discriminator}`,
                avatar: message.author.avatarURL,
                url: message.jumpLink,
                attachments: message.attachments.length,
                state: "available"
            };

            let images = message.attachments.filter(attachment => attachment.content_type.startsWith("image/"));
            if (images.length > 0) {
                reply.image = images[0].url;
            }

            res.send(reply);
        } catch {
            res.send({
                id: req.params.pinid,
                state: "unavailable"
            });
        }
    } catch {
        res.sendStatus(500);
    } finally {
        client.release();
    }
});

router.delete("/:pinid", async (req, res) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }

    let client = await db.get();
    try {
        let response = await client.query("DELETE FROM userpins WHERE id=$1 AND pinid=$2", [req.user.id, req.params.pinid]);
        if (response.rowCount === 0) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    } catch {
        res.sendStatus(500);
    } finally {
        client.release();
    }
})