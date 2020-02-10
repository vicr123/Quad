const handler = require("handler");

handler.register("ping", {}, function(message) {
    message.channel.createMessage("Ping!");
});
