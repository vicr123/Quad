const handler = require("handler");
const config = require("config");
const MemberUtils = require("memberutils");
const moment = require("moment-timezone");

let t = str => str;

handler.register("time", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the time at your location")
        }
    }
}, function(message, opts) {
    if (opts.geographyCoded) {
        message.channel.createMessage(opts.t("{{emoji}} **{{user}}** {{datetime, date}} at {{datetime, stime}}", {
            emoji: ":clock10:",
            user: MemberUtils.tag(message.member),
            datetime: {
                date: moment().tz(opts.geographyCoded.tz),
                h24: true
            }
        }));
    }
});
