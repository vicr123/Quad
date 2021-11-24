const handler = require("handler");
const i18n = require("i18n");


const t = str => str;

handler.register("setlocale", {
    args: [
        {name: "newlocale", type: "string", description: t("The new locale to use"), optional: true}
    ],
    opts: {
        translatorRequired: true,
        dbRequired: true,
		description: t("Set your locale")
    }
}, async (interaction, opts, args) => {
	let locales;
	if (!args.newlocale || !i18n.availableTranslations.includes(args.newlocale)) {
		locales = [];
		for (let locale of i18n.availableTranslations) {
			locales.push(`\`${locale}\` ${(await i18n(locale)).t("TRANSLATORS: Please replace this string with the name of your language (in your native language.)")}`);
		}
	}
	
	if (!args.newlocale) {
		interaction.reply(opts.t("**Locales**\nYou can choose from the following locales:\n{{locales}}", {locales: locales.join("\n")}));
		return;
	}
	if (!i18n.availableTranslations.includes(args.newlocale)) {
		interaction.reply(opts.t("**Invalid Locale**\nSorry, that's not a valid locale. You can choose from the following locales:\n{{locales}}", {locales: locales.join("\n")}));
   		return;
	}

    try {
        await opts.db.query("INSERT INTO locales(id, locale) VALUES($1, $2) ON CONFLICT ON CONSTRAINT locales_pkey DO UPDATE SET locale=$2", [
            interaction.user.id,
            args.newlocale
        ]);
        
        let newT = {t: (await i18n(interaction)).t};
        interaction.reply(newT.t("**Locale Updated**\nYour locale was updated."));
    } catch (err) {
        interaction.reply(opts.t("Couldn't set your locale."));
		console.log(err);
    }
});
