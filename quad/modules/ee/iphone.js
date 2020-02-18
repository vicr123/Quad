const handler = require("handler");
const i18n = require("i18n");

handler.once("botAvailable", () => {
    let oldCreateMessage = handler.bot.createMessage;
    handler.bot.createMessage = (channelID, content, file) => {
        if (Math.random() < 0.01) {
            if (typeof content === "string") {
                content += "\n\nSent from my iPhone";
            } else {
                if (typeof content.content === "string") {
                    content.content += "\n\nSent from my iPhone";
                } else {
                    content.content = "Sent from my iPhone";
                }
            }
        }
        
        return oldCreateMessage.bind(handler.bot)(channelID, content, file);
    }
});