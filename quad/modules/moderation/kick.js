const handler = require("handler");
const Dialog = require("dialog");
const MemberUtils = require("memberutils");
const ignore = require("ignore");
const config = require("config");

const t = str => str;

handler.register("kick", {
    args: [
        {name: "user", type: "user", description: t("The user to kick")}
    ],
    flags: [
        {name: "now", type: "void", description: t("Immediately kick the member without confirmation")}
    ],
    opts: {
        translatorRequired: true,
        permissionsRequired: [
            "mod",
            "kickMembers"
        ]
    }
}, async function(message, opts, args, flags) {
    let higherMember = MemberUtils.higherMember(message.member, args[0]);
    if (!higherMember || higherMember.id !== message.member.id) {
        //Fail
        message.channel.createMessage(opts.t("**Kick a member**\nSorry, you can't kick {{member}}, because their role is higher than or equal to yours.", {
            member: MemberUtils.tag(args[0])
        }));
        return;
    }
    
    if (!flags.now) {
        let d = new Dialog(message.author, message.channel, opts.t, {
            title: opts.t("Kick a member"),
            pending: opts.t("Kick this member?"),
            success: opts.t("This member was kicked from the server"),
            failure: opts.t("Okay, scratch that."),
            fields: [
                {
                    name: opts.t("Member"),
                    value: MemberUtils.tag(args[0])
                }
            ],
            timeout: 10000
        });
        
        try {
            await d.exec();
        } catch (err) {
            return; //Don't do anything if the user cancels
        }
    }
    
    try {
        await message.channel.guild.kickMember(args[0].id);
        if (flags.now) {
            message.channel.createMessage(opts.t("**Kick a member**\n{{member}} was kicked from the server.", {
                member: MemberUtils.tag(args[0])
            }));
        }
    } catch (err) {
        message.channel.createMessage(opts.t("**Kick Failed**\nSorry, {{botname}} couldn't kick {{member}}. Go ahead and check that {{botname}} has permissions to kick members in this server.", {
            botname: config.get("bot.name"),
            member: MemberUtils.tag(args[0])
        }));
    }
});