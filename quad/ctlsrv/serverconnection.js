const config = require("config");
const log = require("log");
const i18n = require("i18n");
const handler = require("handler");

const t = i18n.t;

class ServerConnection {
    #socket;
    #commands;
    
    constructor(socket) {
        this.#socket = socket;
        this.#commands = {
            "exit": handler.exit.bind(handler)
        };
        
        socket.on("message", this.message.bind(this));
        log.Logger.on("line", this.logLine.bind(this));
        
        socket.send({
            type: "welcome",
            botName: config.get("bot.name"),
            version: config.get("bot.version"),
            ready: true
        });
        
        for (let line of log.Logger.history()) {
            this.logLine(line);
        }
    }
    
    message(data) {
        try {
            data = JSON.parse(data);
        } catch (err) {
            //Disconnect the client
            this.close();
            return;
        }
        
        if (data.type === "command") {
            //Parse the command
            let cmd = data.command.split(" ")[0];
            if (this.#commands.hasOwnProperty(cmd)) {
                this.#commands[cmd]();
            } else {
                log(t("quad: {{command}}: command not found", {
                    command: cmd
                }), log.error);
            }
        }
    }
    
    logLine(line) {
        this.#socket.send({
            type: "log",
            line: line
        });
    }
    
    close() {
        this.#socket.close();
    }
}

module.exports = ServerConnection;