const handler = require("handler");
const i18n = require("i18n");

const t = str => str;

handler.register("setlocale", {
    opts: {
        translatorRequired: true
    }
}, async function(message, opts) {
    let locales = [];
    for (let locale of i18n.availableTranslations) {
        locales.push(`\`${locale}\``);
    }
    message.channel.createMessage(opts.t("**Locales**\nYou can choose from the following locales:\n{{locales}}", {locales: locales.join(" ")}));
});

handler.register("setlocale", {
    args: [
        {name: "newLocale", type: "string", description: t("The new locale to use")}
    ],
    opts: {
        translatorRequired: true,
        dbRequired: true
    }
}, async function(message, opts, args) {
    try {
        if (!i18n.availableTranslations.includes(args[0])) {
            message.channel.createMessage(opts.t("**Invalid Locale**\nSorry, that's not a valid locale."));
            return;
        }
        
        await opts.db.query("INSERT INTO userlocales(id, locale) VALUES($1, $2) ON CONFLICT ON CONSTRAINT userlocales_pkey DO UPDATE SET locale=$2", [
            message.author.id,
            args[0]
        ]);
        
        let t = (await i18n(message)).t;
        message.channel.createMessage(t("**Locale Updated**\nYour locale was updated."));
    } catch (err) {
        message.channel.createMessage(opts.t("Couldn't set your locale."));
    }
});
