const handler = require("handler");
const config = require("config");
const moment = require("moment-timezone");
const Geo = require("geo");


function sendDateMessage(interaction, name, date, t) {
    if (date) {
        interaction.reply(t("{{emoji}} **{{name}}** {{datetime, datetime}}", {
            emoji: ":clock10:",
            name: name,
            datetime: {
                date: date,
                h24: true
            }
        }));
    } else {
        interaction.reply(t("{{emoji}} **{{name}}** location not set.", {
            emoji: ":clock10:",
            name: name
        }));
    }
}

const t = str => str;
handler.register("time", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        description: t("Acquire the time at your location")
    }
}, async (interaction, opts) => {
    if (opts.geographyCoded) {
        sendDateMessage(interaction, interaction.user.tag, moment().tz(opts.geographyCoded.tz), opts.t);
    } else {
        sendDateMessage(interaction, interaction.user.tag, null, opts.t);
    }
});

handler.registerParent("timefor", {
	opts: {
        translatorRequired: true,
		description: t("Acquire the time somewhere else")
	}
}).addSub("user", {
	opts: {
		description: t("Acquire the time at a user's location")
	},
	args: [
		{name: "user", type: "user", description: t("The user to get the time for")}
	]
}, async (interaction, opts, args) => {
	try {
		let geo = await Geo.getUser(args.user.id);
		let coded = await Geo.getPlaceName(geo);
		if (coded) {
			sendDateMessage(interaction, interaction.user.tag, moment().tz(coded.tz), opts.t);
		} else {
			sendDateMessage(interaction, interaction.user.tag, null, opts.t);
		}
	} catch {
		// No geonames database present
		interaction.reply(opts.t("This command is currently unavailable."));
	}
}).addSub("city", {
	opts: {
		description: t("Acquire the time in a city")
	},
	args: [
		{name: "city", type: "city", description: t("The city to get the time for")}
	]
}, async (interaction, opts, args) => {
	let coded = args.city;
	if (coded) {
		sendDateMessage(interaction, `${coded.name}, ${coded.country}`, moment().tz(coded.tz), opts.t);
	} else {
		sendDateMessage(interaction, `${coded.name}, ${coded.country}`, null, opts.t);
	}
}).addSub("coords", {
	opts: {
		description: t("Acquire the time at coordinates")
	},
	args: [
		{name: "latitude", type: "number", description: t("Latidude of a point on Earth")},
		{name: "longitude", type: "number", description: t("Longitude of a point on Earth")}
	]
}, async (interaction, opts, args) => {
	try {
		let geo = [args.latitude, args.longitude];
		let coded = await Geo.getPlaceName(geo);
		if (coded) {
			sendDateMessage(interaction, `${Geo.locationToString(geo, opts.t)} (${coded.name})`, moment().tz(coded.tz), opts.t);
		} else {
			sendDateMessage(interaction, `${Geo.locationToString(geo, opts.t)} (${coded.name})`, null, opts.t);
		}
	} catch {
		// No geonames database present
		interaction.reply(opts.t("This command is currently unavailable."));
	}
});

/*
handler.register("time", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        description: t("Acquire the time somewhere else")
    },
    args: [
        {name: "user", type: "globaluser", description: "The user to get the time for"}
    ]
}, async function(message, opts, args) {
    let geo = await Geo.getUser(args[0].id);
    let coded = await Geo.getPlaceName(geo);
    if (coded) {
        sendDateMessage(message, MemberUtils.tag(args[0]), moment().tz(coded.tz), opts.t);
    } else {
        sendDateMessage(message, MemberUtils.tag(args[0]), null, opts.t);
    }
});

handler.register("time", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the time at a location")
        }
    },
    args: [
        {name: "lat", type: "number", description: "Latitude of a point on Earth"},
        {name: "lon", type: "number", description: "Latitude of a point on Earth"}
    ]
}, async function(message, opts, args) {
    let geo = [args[0], args[1]]
    let coded = await Geo.getPlaceName(geo);
    if (coded) {
        sendDateMessage(message, `${Geo.locationToString(geo, opts.t)} (${coded.name})`, moment().tz(coded.tz), opts.t);
    } else {
        sendDateMessage(message, `${Geo.locationToString(geo, opts.t)} (${coded.name})`, null, opts.t);
    }
});*/
