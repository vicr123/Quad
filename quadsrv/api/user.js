const express = require('express');
const db = require('db');
const fs = require('fs');

let router = express.Router();
module.exports = router;

let availableTranslations = fs.readdirSync("../quad/translations");

router.get("/settings", async function(req, res) {
    if (!req.user) {
        res.status(401).send();
    } else {
        let response = {};
        
        let client = await db.get();
        let row = await client.query("SELECT locale FROM userlocales WHERE id=$1", [req.user.id]);
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
                await client.query("INSERT INTO userlocales(id, locale) VALUES($1, $2) ON CONFLICT ON CONSTRAINT userlocales_pkey DO UPDATE SET locale=$2", [req.user.id, req.body.locale]);
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
})