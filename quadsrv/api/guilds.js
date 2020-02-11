const express = require('express');
const db = require('db');
const Fetch = require("fetch");
const bot = require("bot");
const config = require("config");

let router = express.Router();
module.exports = router;

router.get("/:id", async function(req, res) {
    if (!req.user) {
        res.status(401).send();
    } else {
        let resp = {};
        
        let guild = bot.guilds.find(guild => {
            return guild.id === req.params.id;
        });
        if (!guild) {
            res.status(404).send();
            return;
        }
        
        let settings = {};
        let client = await db.get();
        
        let dbResp = await client.query("SELECT prefix FROM guildPrefix WHERE id=$1", [req.params.id]);
        if (dbResp.rowCount > 0) {
            settings.prefix = dbResp.rows[0].prefix;
        } else {
            settings.prefix = config.get("bot.prefix");
        }
        
        client.release();
        resp.settings = settings;
        
        resp.guild = {
            name: guild.name,
            id: guild.id
        }
        
        let channels = guild.channels.reduce((channels, channel) => {
            let descriptor = {
                id: channel.id,
                name: channel.name,
                type: channel.type
            }
            
            if (channel.type === 0) {
                channels.text.push(descriptor);
            } else if (channel.type === 2) {
                channels.voice.push(descriptor);
            } else {
                channels.other.push(descriptor);
            }
            return channels;
        }, {
            text: [],
            voice: [],
            other: []
        });
        
        resp.channels = channels;
        
        res.status(200).send(resp);
    }
});

router.post("/:id/set", async function(req, res) {
    if (!req.user) {
        res.status(401).send();
    } else {
        
        let guild = bot.guilds.find(guild => {
            return guild.id === req.params.id;
        });
        if (!guild) {
            res.status(404).send();
            return;
        }
        
        let me = guild.members.find(member => {
            return member.id === req.user.id
        });
        if (!me) {
            res.status(401).send();
            return;
        }
        
        let permissions = me.permission.json;
        if (!permissions.administrator && !permissions.manageGuild) {
            res.status(401).send();
            return;
        }
        
        let fails = [];

        let client = await db.get();
        if (req.body.prefix) {
            await client.query("INSERT INTO guildPrefix(id, prefix) VALUES($1, $2) ON CONFLICT ON CONSTRAINT guildPrefix_pkey DO UPDATE SET prefix=$2", [req.params.id, req.body.prefix]);
        }
        client.release();
        
        if (fails.length > 0) {
            res.status(200).send({
                fails: fails
            });
        } else {
            res.status(204).send();
        }
    }
})