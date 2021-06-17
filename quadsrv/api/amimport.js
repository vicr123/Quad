const db = require('db');
const fs = require('fs');

let amSettings = (() => {
    try {
        return JSON.parse(fs.readFileSync("settingsdump.json", {
            encoding: "utf8"
        }));
    } catch {
        return {
            users: []
        };
    }
})();

class AMImport {
    user;

    constructor(user) {
        this.user = user;
    }

    canImport() {
        return Object.keys(amSettings.users).includes(this.user) && !amSettings.users[this.user].quadImported;
    }

    numPins() {
        return amSettings.users[this.user].flags.length;
    }

    async doImport() {
        let client = await db.get();
        try {
            await client.query("BEGIN");
            await Promise.all(amSettings.users[this.user].flags.map(async (pin) => {
                //Ensure the pin does not exist
                let response = await client.query("SELECT COUNT(*) AS count FROM userpins WHERE id=$1 AND channel=$2 AND message=$3", [this.user, pin.channel, pin.message]);
                if (response.rows[0].count !== "0") return; //The pin already exists

                //Pin the message
                await client.query("INSERT INTO userPins(pinId, id, channel, message) VALUES(pinIdIncrement($1), $1, $2, $3)", [this.user, pin.channel, pin.message]);
            }));
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }

        amSettings.users[this.user].quadImported = true;
        await fs.promises.writeFile("settingsdump.json", JSON.stringify(amSettings));
    }
}

module.exports = AMImport;