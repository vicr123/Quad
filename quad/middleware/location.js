const Geo = require("geo");
const log = require("log");
const fs = require("fs");

if (!fs.existsSync("./data/geonames.txt")) {
    log("Geonames data not found. Grab a file from http://download.geonames.org/export/dump/ (recommended is cities500.zip) and extract it to data/geonames.txt.", log.warn)
    log("Geonames data is required for geocoding.", log.warn)
}

module.exports = async function(message, opts, cmdOpts, args, flags) {
    if (cmdOpts.locationRequired) {
        opts.geography = await Geo.getUser(message.author.id);
        if (opts.geography && cmdOpts.locationCodedRequired && Geo.canGeocode) {
            opts.geographyCoded = await Geo.getPlaceName(opts.geography);
        }
    }
    return true;
}