const db = require("db");
const fs = require("fs");
const readline = require("readline");
const events = require("events");
const log = require("log");

if (!fs.existsSync("./data/geonames.txt")) {
    log("Geonames data not found. Grab a file from http://download.geonames.org/export/dump/ (recommended is cities500.zip) and extract it to data/geonames.txt.", log.warn)
    log("Geonames data is required for geocoding.", log.warn)
}

module.exports = async function(message, opts, cmdOpts, args, flags) {
    if (cmdOpts.locationRequired) {
        let row = await db.getPool().query("SELECT coords FROM usergeography WHERE id=$1", [message.author.id]);
        if (row.rowCount > 0) {
            opts.geography = [row.rows[0].coords.x, row.rows[0].coords.y];
            
            if (cmdOpts.locationCodedRequired && fs.existsSync("./data/geonames.txt")) {
                let closest = null;
                let reader = readline.createInterface({
                    input: fs.createReadStream("./data/geonames.txt")
                });
                reader.on("line", line => {
                    let bits = line.split("\t");
                    let lat = parseFloat(bits[4]);
                    let lon = parseFloat(bits[5]);
                    
                    let distance = Math.sqrt(
                                       Math.pow(opts.geography[0] - lat, 2) +
                                       Math.pow(opts.geography[1] - lon, 2)
                                   )
                    
                    if (closest !== null) {
                        if (closest.distance < distance) return;
                    }
                    
                    closest = {
                        name: bits[1],
                        country: bits[8],
                        distance: distance,
                        tz: bits[17]
                    };
                });
                
                await events.once(reader, 'close');
                
                opts.geographyCoded = closest;
            }
        } else {
            opts.geography = null;
        }
    }
    return true;
}