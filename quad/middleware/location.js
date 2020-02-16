const db = require("db");

module.exports = async function(message, opts, cmdOpts, args, flags) {
    if (cmdOpts.locationRequired) {
        let row = await db.getPool().query("SELECT coords FROM usergeography WHERE id=$1", [message.author.id]);
        if (row.rowCount > 0) {
            opts.geography = [row.rows[0].coords.x, row.rows[0].coords.y];
        } else {
            opts.geography = null;
        }
    }
    return true;
}