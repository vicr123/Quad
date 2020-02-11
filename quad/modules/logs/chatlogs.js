const handler = require("handler");
const db = require("db");
const moment = require("moment");

async function chatLogsChannel(guild) {
    if (!guild) return null;
    
    let resp = await db.getPool().query("SELECT logs FROM guildLogs WHERE id=$1", [guild.id]);
    if (resp.rowCount == 0) return null;
    let channelId = resp.rows[0].logs;
    let channelObj = guild.channels.find(c => {
        return c.id === channelId;
    });
    if (!channelObj) {
        //TODO: The channel probably no longer exists, so remove it from the database
    }
    return channelObj;
}

handler.listen('messageDelete', async message => {
    let channel = await chatLogsChannel(message.channel.guild);
    if (channel && channel.id != message.channel.id) {
        channel.createMessage(
            `:wastebasket: **${message.author.username}#${message.author.discriminator}** (${message.author.id}) ${message.channel.mention} \`${moment(message.timestamp).toString("dddd, MMMM dd yyyy @ HH:mm (zz)")}.\`
\`\`\`
${message.cleanContent}\`\`\``
        );
    }
});

handler.listen('messageUpdate', async (message, oldMessage) => {
    if (!oldMessage) return;
    let channel = await chatLogsChannel(message.channel.guild);
    if (channel && channel.id != message.channel.id) {
        channel.createMessage(
            `:pencil: **${message.author.username}#${message.author.discriminator}** (${message.author.id}) ${message.channel.mention} \`${moment(message.timestamp).toString("dddd, MMMM dd yyyy @ HH:mm (zz)")}.\`
\`\`\`
${oldMessage.content}\`\`\`\`\`\`
${message.cleanContent}\`\`\`https://discordapp.com/channels/${message.channel.guild.id}/${message.channel.id}/${message.id}`
        );
    }
});