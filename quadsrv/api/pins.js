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
            let message = await bot.getMessage(data.channel, data.message);

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

    /*
    				{
					id: 1,
					content: "This is a pinned message.",
					author: "discordtag#1234",
					avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
					url: "https://discord.com/"
				}
                */
})