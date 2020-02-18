const handler = require("handler");
const config = require("config")

let t = str => str;

function getMatchingCommands(commandName, member) {
    return handler.commands.filter(command => {
        if (!command.canRun(member)) return false;
        return command.name === commandName;
    });
}

handler.register("help", {
    opts: {
        translatorRequired: true,
        help: {
            description: t("Acquire usage information about the bot")
        }
    }
}, function(message, opts, args) {
    let commandsString = [];
    for (let command of handler.commands) {
        if (!command.canRun(message.member)) continue;
        
        let s = `\`${command.name}\``;
        if (!commandsString.includes(s)) commandsString.push(s);
    }
    
    commandsString.sort();
    
    message.channel.createMessage({
        embed: {
            title: opts.t("{{botname}} Help", {botname: config.get("bot.name")}),
            description: opts.t("Choose from the following commands. You can use {{prefix}}help [command] for more information about a command.", {prefix: opts.prefix}),
            fields: [
                {
                    name: opts.t("Commands"),
                    value: commandsString.join("\n")
                },
                {
                    name: opts.t("Configuration"),
                    value: opts.t("If you need to change any settings, you can visit [{{website}}]({{website}})", {
                        website: config.get("server.rootAddress")
                    })
                }
            ]
        }
    })
});

handler.register("help", {
    opts: {
        translatorRequired: true,
        help: {
            description: t("Acquire usage information about a command")
        }
    },
    args: [
        {name: "command", type: "string", description: t("The command to acquire usage information about")}
    ]
}, function(message, opts, args) {
    let commandName = args[0];
    if (handler.readlink(commandName)) commandName = handler.readlink(commandName);
    let matching = getMatchingCommands(commandName, message.member);
    
    if (matching.length === 0) {
        message.channel.createMessage(opts.t("**Help**\nThat command couldn't be found."));
    } else if (matching.length === 1) {
        message.channel.createMessage({
            embed: matching[0].helpEmbed(opts.t, opts.prefix, args[0])
        });
    } else {
        let messageSend = opts.t("**Help**\nThere are multiple ways to run this command. Select the one you wanted:\n");
        let lines = [];
        for (let i = 0; i < matching.length; i++) {
            let command = matching[i];
            lines.push(opts.t("{{helpcommand}} for {{commandsignature}}", {
                helpcommand: `• \`${opts.prefix}help ${args[0]} ${i}\``,
                commandsignature: `\`${opts.prefix}${args[0]} ${command.args.map(arg => {
                        return arg.name
                    }).join(" ")}\``
            }));
        }
        messageSend += lines.join("\n");
        message.channel.createMessage(messageSend);
    }
});

handler.register("help", {
    opts: {
        translatorRequired: true,
        help: {
            description: t("Acquire usage information about a command")
        }
    },
    args: [
        {name: "command", type: "string", description: t("The command to acquire usage information about")},
        {name: "index", type: "number", description: t("The index of the command, if there is more than one command with the same name")}
    ]
}, function(message, opts, args) {
    let commandName = args[0];
    if (handler.readlink(commandName)) commandName = handler.readlink(commandName);
    let matching = getMatchingCommands(commandName, message.member);
    
    if (matching.length > args[1]) {
        message.channel.createMessage({
            embed: matching[args[1]].helpEmbed(opts.t, opts.prefix, args[0])
        });
    } else {
        message.channel.createMessage(opts.t("**Help**\nThat command couldn't be found."));
    }
});

handler.link("advice", "help");