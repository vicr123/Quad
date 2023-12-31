const handler = require("handler");
const config = require("config");
const MemberUtils = require("memberutils");
const Canvas = require("canvas");
const fetch = require("node-fetch");
const moment = require("moment");
const fs = require("fs");
const Geo = require("geo");
const Conditions = require("./conditions");

let t = str => str;

function drawSquashedText(ctx, x, y, text, fontSize, pen, maxWidth, alignCenter = true) {
    ctx.font = `${fontSize}px Contemporary`;
    ctx.fillStyle = pen;
    let metrics = ctx.measureText(text);
    metrics.height = metrics.emHeightAscent + metrics.emHeightDescent;

    let drawAt = [];
    if (alignCenter) {
        drawAt.push(x - Math.min(metrics.width, maxWidth) / 2);
        drawAt.push(y - metrics.height / 2);
    } else {
        drawAt.push(x);
        drawAt.push(y);
    }

    if (metrics.width > maxWidth) {
        let textCanvas = Canvas.createCanvas(metrics.width, metrics.height);
        let txtCtx = textCanvas.getContext('2d');
        txtCtx.font = `${fontSize}px Contemporary`;
        txtCtx.fillStyle = pen;
        txtCtx.textBaseline = "top";
        txtCtx.fillText(text, 0, 0);

        ctx.drawImage(textCanvas, drawAt[0], drawAt[1], maxWidth, metrics.height);
    } else {
        ctx.fillText(text, drawAt[0], drawAt[1] + metrics.height)
    }
    return metrics.height;
}

async function weatherImage(data, t) {
    let canvas = Canvas.createCanvas(500, 410);
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = data.primaryFill;
    ctx.fillRect(0, 0, 350, 410);
    ctx.fillStyle = data.secondaryFill;
    ctx.fillRect(350, 0, 150, 410);

    drawSquashedText(ctx, 350 / 2, 15, data.title, 20, data.pen, 325);

    //Draw the main weather pane
    let mainData = data.byTime[0];

    const yOffsetWhileWeDontHaveExtraData = 35;

    ctx.drawImage(mainData.condition.image, 100, yOffsetWhileWeDontHaveExtraData + 50);
    // drawSquashedText(ctx, 10, 45, `${mainData.temp}°`, 80, data.pen, 325, false);
    drawSquashedText(ctx, 350 / 2, yOffsetWhileWeDontHaveExtraData + 220, mainData.location.toUpperCase(), "bold 20", data.pen, 325);
    drawSquashedText(ctx, 350 / 2, yOffsetWhileWeDontHaveExtraData + 250, `${t(mainData.condition.text)}`, 20, data.pen, 325);
    drawSquashedText(ctx, 350 / 2, yOffsetWhileWeDontHaveExtraData + 280, `${mainData.temp}°C • ${mainData.tempF}°F`, 20, data.pen, 325);

    //Draw the five aux weather panes
    for (let i = 1; i < 6; i++) {
        let dayData = data.byTime[i];
        ctx.rotate(-Math.PI / 2);
        drawSquashedText(ctx, -((i - 1) * 82 + 41), 360, dayData.text, 20, data.pen, 72);
        ctx.rotate(Math.PI / 2);

        ctx.drawImage(dayData.condition.image, 380, (i - 1) * 82 + 9, 64, 64);
        // ctx.fillText((data.hasOwnProperty("maxTemperature") ? parseFloat(data.maxTemperature.value).toFixed() : "---") + "°", 450, (current - 1) * 82 + 30);
        // ctx.fillText((data.hasOwnProperty("minTemperature") ? parseFloat(data.minTemperature.value).toFixed() : "---") + "°", 450, (current - 1) * 82 + 60);
        drawSquashedText(ctx, 450, (i - 1) * 82 + 12, `${dayData.temp}°C`, 20, data.pen, 40, false);
        drawSquashedText(ctx, 450, (i - 1) * 82 + 42, `${dayData.tempF}°F`, 20, data.pen, 40, false);
    }


    //Trigger the weird man
    if (Math.random() < 0.01 && Conditions.manImage()) {
        ctx.drawImage(Conditions.manImage(), 0, 0);
    }

    return canvas.toBuffer();
}

async function handleWeather(channel, geography, coded, userName, t) {
    let message = await channel.createMessage(t("Retrieving the weather..."));
    try {
        let weatherDetailsResponse = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${geography[0]}&lon=${geography[1]}`, {
            headers: {
                "User-Agent": "Quad/1.0 github.com/vicr123/Quad"
            }
        });
        let weatherDetails = await weatherDetailsResponse.json();
    
        let units = weatherDetails.properties.meta.units;
        let timeseries = weatherDetails.properties.timeseries;
    
        if (timeseries.length < 6) {
    
        } else {
            let fullWeatherData = {};
    
            fullWeatherData.title = t("Hourly Weather");
            if (userName) fullWeatherData.title += ` - ${userName}`;
    
            let weatherData = [];
            let firstData = timeseries[0].data;
            let condition = Conditions.conditionForSymbol(firstData.next_1_hours.summary.symbol_code);
            weatherData.push({
                temp: Math.round(firstData.instant.details.air_temperature),
                tempF: Math.round(celsiusToFahrenheit(firstData.instant.details.air_temperature)),
                location: `${coded.name}, ${coded.country}`,
                condition: condition
            });
    
            if (condition.background === "clear") {
                if (condition.isNight) {
                    fullWeatherData.primaryFill = "rgb(0, 25, 80)";
                    fullWeatherData.secondaryFill = "rgb(0, 10, 35)";
                    fullWeatherData.pen = "white";
                } else {
                    fullWeatherData.primaryFill = "rgb(120, 200, 255)";
                    fullWeatherData.secondaryFill = "rgb(50, 180, 255)";
                    fullWeatherData.pen = "black";
                }
            } else {
                fullWeatherData.primaryFill = "rgb(200, 200, 200)";
                fullWeatherData.secondaryFill = "rgb(170, 170, 170)";
                fullWeatherData.pen = "black";
            }
    
            for (let i = 1; i < 6; i++) {
                let data = timeseries[i].data;
                // moment().tz(opts.geographyCoded.tz)
                weatherData.push({
                    text: moment(timeseries[i].time).tz(coded.tz).format("HH:mm"),
                    condition: Conditions.conditionForSymbol(data.next_1_hours.summary.symbol_code),
                    temp: Math.round(data.instant.details.air_temperature),
                    tempF: Math.round(celsiusToFahrenheit(data.instant.details.air_temperature)),
                });
            }
    
            fullWeatherData.byTime = weatherData;

            const spiffy = [
                t('Feel free to print this'),
                t('Please tear on the perforated line'),
                t('So hot outside...'),
                t('Are the days getting longer?'),
                t('I wonder if Victor would wear a ski jacket in this weather...')
            ]
    
            await channel.createMessage({
                embed: {
                    title: t("Weather"),
                    url: "https://met.no/",
                    image: {
                        url: "attachment://weather.png",
                        width: 500,
                        height: 410
                    },
                    footer: {
                        text: spiffy[Math.floor(Math.random() * spiffy.length)]
                    }
                }
            },
                {
                    file: await weatherImage(fullWeatherData, t),
                    name: "weather.png"
                }
            );
            await channel.deleteMessage(message.id);
        }
    } catch (e) {
        await handleWeatherError(channel, t("Weather Error"), t("Weather is unavailable"));
        await channel.deleteMessage(message.id);
    }
}

async function handleWeatherError(channel, title, subtitle) {
    let canvas = Canvas.createCanvas(500, 410);
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = "rgb(120, 200, 255)";
    ctx.fillRect(0, 0, 350, 410);
    ctx.fillStyle = "rgb(50, 180, 255)";
    ctx.fillRect(350, 0, 150, 410);
    
    //Now overlay the weather with an error
    ctx.fillStyle = "rgba(255, 0, 0, 0.65)";
    ctx.fillRect(0, 0, 500, 410);

    ctx.drawImage(Conditions.unavailImage(), 175, 60, 150, 150);
    drawSquashedText(ctx, 500 / 2, 265, title, 30, "white", 480);

    let y = 310;
    for (let line of subtitle.split("\n")) {
        y += drawSquashedText(ctx, 500 / 2, y, line, 20, "white", 480);
    }

    await channel.createMessage({
        embed: {
            title: t("Weather"),
            image: {
                url: "attachment://weather.png",
                width: 500,
                height: 410
            }
        }
    },
        {
            file: canvas.toBuffer(),
            name: "weather.png"
        }
    );
}

function celsiusToFahrenheit(temp) {
	return (temp * 9 / 5) + 32
}

handler.register("weather", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the weather at your location")
        }
    }
}, function (message, opts) {
    if (opts.geography) {
        handleWeather(message.channel, opts.geography, opts.geographyCoded, MemberUtils.tag(message.author), opts.t);
    } else {
        handleWeatherError(message.channel, opts.t("Location Not Set"), opts.t("Set your location using the\nQuad Configuration first!"));
    }
});

handler.register("weather", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the weather at a user's location")
        }
    },
    args: [
        {name: "user", type: "globaluser", description: "The user to get the weather for"}
    ]
}, async function(message, opts, args) {
    let geo = await Geo.getUser(args[0].id);
    let coded = await Geo.getPlaceName(geo);
    if (coded) {
        handleWeather(message.channel, geo, coded, null, opts.t);
    } else {
        handleWeatherError(message.channel, opts.t("Location Not Set"), opts.t("{{member}} needs to set their location\nusing the Quad configuration first.", {member: MemberUtils.tag(args[0])}));
    }
});

handler.register("weather", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the weather at a specific city")
        }
    },
    args: [
        {name: "city", type: "city", description: "The city to get the weather for"}
    ]
}, async function(message, opts, args) {
    if (args[0]) {
        handleWeather(message.channel, args[0].location, args[0], null, opts.t);
    } else {
        handleWeatherError(message.channel, opts.t("Invalid City"), opts.t("Couldn't find that city in the database."));
    }
});

handler.register("weather", {
    opts: {
        translatorRequired: true,
        locationRequired: true,
        locationCodedRequired: true,
        help: {
            description: t("Acquire the weather at a location")
        }
    },
    args: [
        { name: "lat", type: "number", description: "Latitude of a point on Earth" },
        { name: "lon", type: "number", description: "Latitude of a point on Earth" }
    ]
}, async function (message, opts, args) {
    let geo = [args[0], args[1]]
    let coded = await Geo.getPlaceName(geo);
    if (coded) {
        handleWeather(message.channel, geo, coded, null, opts.t);
    } else {
        // sendDateMessage(message, `${Geo.locationToString(geo, opts.t)} (${coded.name})`, null, opts.t);
        handleWeatherError(message.channel, opts.t("Couldn't retrieve that place"), opts.t("That place on Earth doesn't seem to exist! [You should never get this error]"));
    }
});
