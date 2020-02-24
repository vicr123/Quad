const ws = require('ws');
const config = require('config');
const EventEmitter = require('events');

class Client extends EventEmitter {
    #client;
    
    constructor() {
        super();
        
        console.log("Connecting...");
        
        this.#client = new ws(`ws+unix:///tmp/${config.get("bot.name")}-ctl`);
        this.#client.on("message", this.message.bind(this));
        this.#client.on("close", this.emit.bind(this, "close"));
    }
    
    message(data) {
        data = JSON.parse(data);
        if (data.type === "welcome") {
            this.emit("ready");
        } else if (data.type === "log") {
            this.emit("log", data.line);
        }
    }
    
    runCommand(command) {
        this.#client.send(JSON.stringify({
            type: "command",
            command: command
        }));
    }
}

module.exports = Client;