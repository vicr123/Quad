const blessed = require("neo-blessed");
const config = require("config");

function makeButton(text, options) {
    options.content = text;
    options.width = text.length;
    options.clickable = true;
    options.style = {
        fg: "yellow",
        bg: "blue"
    }
    return blessed.button(options);
}

class Screen {
    #client;
    #screen;
    #logBox;
    
    #mainBox;
    
    #commandContainer;
    #commandMode;
    #commandBox;
    
    constructor(client) {
        this.#client = client;
        this.#commandMode = false;
        
        this.#screen = blessed.screen({
            smartCSR: true,
            fullUnicode: true
        });
        
        let mainBox = blessed.box({
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
        });
        this.#screen.append(mainBox);
        this.#mainBox = mainBox;
        
        let titleBox = blessed.box({
            top: 0,
            left: 0,
            width: "100%",
            height: 1,
            content: ` ${config.get("bot.name")} ${config.get("bot.version")}`,
            style: {
                fg: "black",
                bg: "white"
            }
        })
        mainBox.append(titleBox);
        
        let hudBox = blessed.box({
            top: "100%-1",
            left: 0,
            width: "100%",
            height: 1,
            content: "",
            style: {
                fg: "black",
                bg: "white"
            }
        })
        mainBox.append(hudBox);
        
        let exitButton = makeButton("^C Exit", {
            top: 0,
            left: 1
        });
        exitButton.on("press", this.exit.bind(this));
        mainBox.key(['C-c'], this.exit.bind(this));
        hudBox.append(exitButton);
        
        let cmdModeButton = makeButton("T Enter Command", {
            top: 0,
            left: 2 + exitButton.width
        });
        cmdModeButton.on("press", this.setCommandMode.bind(this, true));
        mainBox.key(['t',':'], this.setCommandMode.bind(this, true));
        hudBox.append(cmdModeButton);
        
        let bottomButton = makeButton("^Down Scroll to Bottom", {
            top: 0,
            right: 1
        });
        bottomButton.on("press", this.scrollLogToBottom.bind(this));
        mainBox.key(['C-down'], this.scrollLogToBottom.bind(this));
        hudBox.append(bottomButton);
        
        this.#logBox = blessed.log({
            top: 1,
            left: 0,
            width: "100%",
            height: "100%-2"
        });
        mainBox.key(['up'], () => {
            this.#logBox.scroll(-1);
            this.render();
        });
        mainBox.key(['down'], () => {
            this.#logBox.scroll(1);
            this.render();
        });
        mainBox.append(this.#logBox);
        
        this.#commandContainer = blessed.box({
            top: "100%-1",
            left: 0,
            width: "100%",
            height: 1,
            content: "",
            hidden: true,
            style: {
                fg: "black",
                bg: "white"
            }
        });
        mainBox.append(this.#commandContainer);
        
        let cancelCommandButton = makeButton("ESC Cancel", {
            top: 0,
            left: 1
        });
        cancelCommandButton.on("press", this.setCommandMode.bind(this, false));
        this.#commandContainer.append(cancelCommandButton);
        
        let commandText = blessed.box({
            top: 0,
            left: cancelCommandButton.width + 2,
            width: "Enter command: ".length,
            content: "Enter command: ",
            style: {
                fg: "black",
                bg: "white"
            }
        });
        this.#commandContainer.append(commandText);
        
        this.#commandBox = blessed.textbox({
            top: 0,
            left: cancelCommandButton.width + 2 + commandText.width,
            input: true,
            keyable: true,
            style: {
                fg: "black",
                bg: "white"
            }
        })
        this.#commandBox.on("keypress", this.commandBoxKeypress.bind(this));
        this.#commandBox.on("submit", this.runCommand.bind(this));
        this.#commandContainer.append(this.#commandBox);
        
        client.on("log", this.log.bind(this));
        client.on("close", this.log.bind(this, "Connection closed"));
        
        this.#screen.enableMouse();
        
        this.render();
    }
    
    exit() {
        process.exit(0);
    }
    
    log(line) {
        this.#logBox.log(line);
    }
    
    commandBoxKeypress(keyChar, key) {
        if (key.name === "escape") {
            this.setCommandMode(false);
        }
    }
    
    scrollLogToBottom() {
        this.#logBox.setScrollPerc(100);
        this.render();
    }
    
    setCommandMode(on) {
        if (on) {
            this.#commandBox.clearValue();
            this.#commandContainer.show();
            this.#commandMode = true;
            this.#commandBox.readInput();
        } else {
            this.#commandBox.cancel();
            this.#commandContainer.hide();
            this.#commandMode = false;
            this.#mainBox.focus();
        }
        this.render();
    }
    
    runCommand(command) {
        this.log(command);
        this.setCommandMode(false);
        this.#client.runCommand(command);
    }
    
    render() {
        this.#screen.render();
    }
}

module.exports = Screen;