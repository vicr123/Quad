const handler = require("handler");
const Dialog = require("dialog");
const MemberUtils = require("memberutils");
const ignore = require("ignore");
const config = require("config");

const t = str => str;

handler.register("ban", {
    args: [
        {name: "user", type: "user", description: t("The user to ban")}
    ],
    flags: [
        {name: "now", type: "void", description: t("Immediately ban the member without confirmation")},
        {name: "deleteDays", type: "integer", description: t("Days of messages to delete")}
    ],
    opts: {
        translatorRequired: true,
        permissionsRequired: [
            "mod",
            "banMembers"
        ]
    }
}, async function(message, opts, args, flags) {
    let higherMember = MemberUtils.higherMember(message.member, args[0]);
    if (!higherMember || higherMember.id !== message.member.id) {
        //Fail
        message.channel.createMessage(opts.t("**Ban a member**\nSorry, you can't ban {{member}}, because their role is higher than or equal to yours.", {
            member: MemberUtils.tag(args[0])
        }));
        return;
    }
    
    let me = MemberUtils.botMember(message.channel.guild);
    higherMember = MemberUtils.higherMember(me, args[0]);
    if (!higherMember || higherMember.id !== me.id) {
        //Fail
        message.channel.createMessage(opts.t("**Ban a member**\nSorry, {{botname}} can't ban {{member}}, because {{member}}'s role is higher than {{botname}}'s.", {
            botname: config.get("bot.name"),
            member: MemberUtils.tag(args[0])
        }));
        return;
    }
    
    let deleteMessages = flags.deleteDays;
    if (!deleteMessages) deleteMessages = 0;
    
    if (deleteMessages < 0) {
        //Fail
        message.channel.createMessage(opts.t("**Ban a member**\nSorry, you can't delete messages less than 0 days old."));
        return;
    } else if (deleteMessages > 7) {
        //Fail
        message.channel.createMessage(opts.t("**Ban a member**\nSorry, you can't delete messages more than 7 days old."));
        return;
    }
    
    if (!flags.now) {
        let d = new Dialog(message.author, message.channel, opts.t, {
            title: opts.t("Ban a member"),
            pending: opts.t("Ban this member?"),
            success: opts.t("This member was banned from the server"),
            failure: opts.t("Okay, scratch that."),
            fields: [
                {
                    name: opts.t("Member"),
                    value: MemberUtils.tag(args[0])
                },
                {
                    name: opts.t("Days to delete"),
                    value: deleteMessages
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
        await message.channel.guild.banMember(args[0].id, deleteMessages);
        if (flags.now) {
            message.channel.createMessage(opts.t("**Ban a member**\n{{member}} was banned from the server.", {
                member: MemberUtils.tag(args[0])
            }));
        }
    } catch (err) {
        message.channel.createMessage(opts.t("**Ban Failed**\nSorry, {{botname}} couldn't ban {{member}}. Go ahead and check that {{botname}} has permissions to ban members in this server.", {
            botname: config.get("bot.name"),
            member: MemberUtils.tag(args[0])
        }));
    }
});