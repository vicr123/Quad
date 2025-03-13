const express = require('express');
const db = require('db');
const fs = require('fs');
const AMImport = require('./amimport');
const {generateSecret, SignJWT, jwtVerify} = require("jose");

let exportKeySecret;

(async () => {
    exportKeySecret = await generateSecret("HS256");
})();

const pins = require('./pins');
const config = require("config");

let router = express.Router();
module.exports = router;

let availableTranslations = fs.readdirSync("../quad/translations");

router.use("/pins", pins);

router.get("/settings", async function(req, res) {
    if (!req.user) {
        res.status(401).send();
    } else {
        let response = {};

        let amImport = new AMImport(req.user.id);
        
        let client = await db.get();
        let row = await client.query("SELECT locale FROM locales WHERE id=$1", [req.user.id]);
        if (row.rowCount > 0) {
            response.locale = row.rows[0].locale;
        } else {
            response.locale = "en";
        }
        
        row = await client.query("SELECT coords FROM usergeography WHERE id=$1", [req.user.id]);
        if (row.rowCount > 0) {
            response.geography = [row.rows[0].coords.x, row.rows[0].coords.y];
        } else {
            response.geography = null;
        }
        
        response.availableLocales = availableTranslations;

        if (amImport.canImport()) {
            response.canImportAM = {
                numPins: amImport.numPins()
            }
        }

        client.release();
        
        res.status(200).send(response);
    }
});

router.post("/set", async function(req, res) {
    if (!req.user) {
        res.status(401).send();
    } else {
        let fails = [];
        
        let client = await db.get();
        if (req.body.locale) {
            //Ensure the locale is valid
            if (availableTranslations.includes(req.body.locale)) {
                await client.query("INSERT INTO locales(id, locale) VALUES($1, $2) ON CONFLICT ON CONSTRAINT locales_pkey DO UPDATE SET locale=$2", [req.user.id, req.body.locale]);
            } else {
                fails.push("Invalid Locale");
            }
        }
        if (req.body.hasOwnProperty("geography")) {
            if (Array.isArray(req.body.geography) && req.body.geography.length === 2 &&
                req.body.geography[0] >= -90 && req.body.geography[0] <= 90 &&
                req.body.geography[1] >= -180 && req.body.geography[0] <= 90) {
                await client.query("INSERT INTO usergeography(id, coords) VALUES($1, $2) ON CONFLICT ON CONSTRAINT usergeography_pkey DO UPDATE SET coords=$2", [req.user.id, 
                    `${req.body.geography[0]},${req.body.geography[1]}`
                ]);
            } else if (req.body.geography === null) {
                await client.query("DELETE FROM usergeography WHERE id=$1", [req.user.id]);
            } else {
                fails.push("Invalid Geography");
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
    }
});

router.post("/importAM", async (req, res) => {
    if (!req.user) {
        res.status(401).send();
    } else {
        try {
            let amImport = new AMImport(req.user.id);
            await amImport.doImport();
            
            res.status(204).send();
        } catch {
            res.status(500).send();
        }
    }
});

router.post("/exportToken", async (req, res) => {
    if (!req.user) {
        res.status(401).send();
    } else {
        try {
            const jwt = await new SignJWT({
                endpoint: `${config.get("server.rootAddress")}/api/user/exportPackage`
            })
                .setProtectedHeader({
                    alg: "HS256"
                })
                .setIssuer("quad")
                .setExpirationTime(new Date().getTime() + 60 * 60 * 1000)
                .setSubject(req.user.id)
                .sign(exportKeySecret);

            res.status(200).send({
                token: jwt
            });
        } catch {
            res.status(500).send();
        }
    }
});

router.get("/exportPackage", async (req, res) => {
    let authHeader = req.get("Authorization");
    if (!(authHeader && authHeader.startsWith("Bearer "))) {
        res.status(401).send();
        return;
    }

    let token = authHeader.substr(6);
    const {payload, protectedHeader} = await jwtVerify(token, exportKeySecret, {
        issuer: "quad"
    });

    if (payload.exp < new Date().getTime()) {
        res.status(401).send();
        return;
    }

    let client = await db.get();
    const subject = payload.sub;

    try {
        const pinResponse = await client.query("SELECT channel, message FROM userPins WHERE id=$1", [subject]);
        res.send({
            pins: pinResponse.rows.map(row => ({
                channel: row.channel,
                message: row.message
            }))
        });
    } catch {
        res.status(500).send();
    }
});