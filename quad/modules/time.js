const handler = require("handler");
const config = require("config");
const MemberUtils = require("memberutils");
const moment = require("moment-timezone");
const Geo = require("geo");

let t = str => str;

function sendDateMessage(message, name, date, t) {
    if (date) {
        message.channel.createMessage(t("{{emoji}} **{{name}}** {{datetime, date}} at {{datetime, stime}}", {
            emoji: ":clock10:",
            name: name,
            datetime: {
                date: date,
                h24: true
            }
        }));
    } else {
        message.channel.createMessage(t("{{emoji}} **{{name}}** location not set.", {
            emoji: ":clock10:",
            name: name
        }));
    }
}

handler.register("time", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the time at your location")
        }
    }
}, async function(message, opts) {
    if (opts.geographyCoded) {
        sendDateMessage(message, MemberUtils.tag(message.member), moment().tz(opts.geographyCoded.tz), opts.t);
    }
});

handler.register("time", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the time at a user's location")
        }
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
});