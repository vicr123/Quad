const express = require('express');
const db = require('db');
const Fetch = require("fetch");
const bot = require("bot");
const config = require("config");

let router = express.Router();
module.exports = router;

router.use("/:id", async function(req, res, next) {
    if (!req.user) {
        res.status(401).send();
        return;
    }
    
    req.guild = bot.guilds.find(guild => {
        return guild.id === req.params.id;
    });
    if (!req.guild) {
        res.status(404).send();
        return;
    }
    
    let me = req.guild.members.find(member => {
        return member.id === req.user.id
    });
    if (!me) {
        res.status(401).send();
        return;
    }
    
    let permissions = me.permission.json;
    req.canManage = (permissions.administrator || permissions.manageGuild);
    next();
})

router.get("/:id", async function(req, res) {
    let resp = {};
    
    let settings = {};
    let client = await db.get();
    
    let dbResp = await client.query("SELECT prefix FROM guildPrefix WHERE id=$1", [req.params.id]);
    if (dbResp.rowCount > 0) {
        settings.prefix = dbResp.rows[0].prefix;
    } else {
        settings.prefix = config.get("bot.prefix");
    }
    
    dbResp = await client.query("SELECT alerts, logs FROM guildLogs WHERE id=$1", [req.params.id]);
    let logs;
    if (dbResp.rowCount > 0) {
        logs = dbResp.rows[0];
    } else {
        logs = {};
    }
    settings.alerts = logs.alerts;
    settings.chatlogs = logs.logs;
    
    client.release();
    resp.settings = settings;
    
    resp.guild = {
        name: req.guild.name,
        id: req.guild.id
    }
    
    let channels = req.guild.channels.reduce((channels, channel) => {
        let descriptor = {
            id: channel.id,
            name: channel.name,
            position: channel.position,
            parent: channel.parentID,
            type: channel.type
        }
        
        if (channel.type === 0) {
            channels.text.push(descriptor);
        } else if (channel.type === 2) {
            channels.voice.push(descriptor);
        } else if (channel.type === 4) {
            channels.category.push(descriptor);
        } else {
            channels.other.push(descriptor);
        }
        channels.currentIndex++;
        return channels;
    }, {
        text: [],
        voice: [],
        category: [],
        other: [],
        currentIndex: 0
    });
    
    resp.channels = channels;
    
    res.status(200).send(resp);
});

router.post("/:id/set", async function(req, res) {
    if (!req.canManage) {
        res.status(401).send();
        return;
    }
    
    let fails = [];
    
    let client = await db.get();
    if (req.body.prefix) {
        await client.query("INSERT INTO guildPrefix(id, prefix) VALUES($1, $2) ON CONFLICT ON CONSTRAINT guildPrefix_pkey DO UPDATE SET prefix=$2", [req.params.id, req.body.prefix]);
    }
    if (req.body.chatlogs) {
        let channel = req.guild.channels.find(channel => {
            return channel.id === req.body.chatlogs;
        });
        if (channel) {
            await client.query("INSERT INTO guildLogs(id, logs) VALUES($1, $2) ON CONFLICT ON CONSTRAINT guildLogs_pkey DO UPDATE SET logs=$2", [req.params.id, req.body.chatlogs]);
        } else {
            fails.push("Invalid Chat Logs channel");
        }
    }
    if (req.body.alerts) {
        let channel = req.guild.channels.find(channel => {
            return channel.id === req.body.alerts;
        });
        if (channel) {
            await client.query("INSERT INTO guildLogs(id, alerts) VALUES($1, $2) ON CONFLICT ON CONSTRAINT guildLogs_pkey DO UPDATE SET alerts=$2", [req.params.id, req.body.alerts]);
        } else {
            fails.push("Invalid Alerts channel");
        }
    }
    client.release();
    
    if (fails.length > 0) {
        res.status(200).send({
            fails: fails
        });
    } else {
        res.status(204).send();
    }
});

router.delete("/:id/set", async function(req, res) {
    if (!req.canManage) {
        res.status(401).send();
        return;
    }
    
    let client = await db.get();
    await client.query("DELETE FROM guildPrefix WHERE id=$1", [req.params.id]);
    await client.query("DELETE FROM guildLogs WHERE id=$1", [req.params.id]);
    client.release();

    res.status(204).send();    
})
