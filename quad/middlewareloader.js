const fs = require("fs");
const log = require("log");
const i18n = require('i18n');

const t = i18n.t;

class MiddlewareLoader {
    #middleware;
    
    init() {
        this.#middleware = [];
        
        for (let mw of fs.readdirSync("middleware")) {
            this.load(mw);
        }
    }
    
    load(mw) {
        log(t("Loading middleware {{MIDDLEWARE}}", {"MIDDLEWARE": mw}));
        if (fs.lstatSync(`./middleware/${mw}`).isDirectory()) {
            for (let submodule of fs.readdirSync(`middleware/${mw}`)) {
                this.load(`${mw}/${submodule}`);
            }
        } else {
            this.#middleware.push(require(`./middleware/${mw}`));
        }
    }
    
    async run(interaction, opts, cmdOpts, args) {
        try {
            for (let mw of this.#middleware) {
                if (!await mw(interaction, opts, cmdOpts, args)) return false;
            }
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

module.exports = MiddlewareLoader;
