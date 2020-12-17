const fs = require("fs");
const log = require("log");
const i18n = require('i18n');

const t = i18n.t;

class ModLoader {
    init() {
        for (let module of fs.readdirSync("modules")) {
            this.load(module);
        }
    }
    
    load(module) {
        log(t("Loading module {{MODULE}}", {"MODULE": module}));
        if (fs.lstatSync(`./modules/${module}`).isDirectory()) {
            for (let submodule of fs.readdirSync(`modules/${module}`)) {
                this.load(`${module}/${submodule}`);
            }
        } else {
            if (!module.endsWith(".js")) return;
            try {
                let m = require(`./modules/${module}`);
            } catch (e) {
                log(t("Loading module {{MODULE}} failed!", {"MODULE": module}), log.error);
                log(e.stack, log.error);
            }
        }
    }
}

let m = new ModLoader();
module.exports = m;