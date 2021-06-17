const handler = require("handler");
const db = require("db");

async function alertsChannel(guild, client = null) {
    if (!guild) return null;
    
    if (!client) client = db.getPool();
    let resp = await client.query("SELECT alerts FROM guildLogs WHERE id=$1", [guild.id]);
    if (resp.rowCount == 0) return null;
    let channelId = resp.rows[0].alerts;
    let channelObj = guild.channels.find(c => {
        return c.id === channelId;
    });
    if (!channelObj) {
        //TODO: The channel probably no longer exists, so remove it from the database
    }
    return channelObj;
}

handler.listen("guildMemberAdd", async (guild, member) => {
    if (member.username.toLowerCase().includes("h0nde")) {
        try {
            await member.ban(1, "Auto ban; contact vicr123#4567 if false positive.");
    
            let channel = await alertsChannel(guild);
            if (channel) {
                //TODO: Send extended user information
                channel.createMessage(`Quad automatically banned a user. Check the Audit Logs for more details.`);
            }
        } catch {
            //Ignore the error
        }
    }
});