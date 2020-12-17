const handler = require("handler");
const config = require("config");
const MemberUtils = require("memberutils");
const Canvas = require("canvas");
const fetch = require("node-fetch");
const moment = require("moment");
const fs = require("fs");
const Geo = require("geo");

let t = str => str;

let sunnyImage, moonyImage, cloudyImage, thunderImage, rainImage, windImage, fogImage, humidImage, pressureImage, sunriseImage, sunsetImage, compassImage, snowImage, rainsnowImage, questionImage, unavailImage;

function conditionForSymbol(symbol) {
    const codes = {
        "snow": {
            text: t('Snow'),
            image: snowImage,
            background: "cloud"
        },
        "lightrainandthunder": {
            text: t('Light rain and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "heavysleetshowersandthunder": {
            text: t('Heavy sleet, showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "lightsnow": {
            text: t('Light snow'),
            image: snowImage,
            background: "clear"
        },
        "heavysnow": {
            text: t('Heavy snow'),
            image: snowImage,
            background: "cloud"
        },
        "snowshowers": {
            text: t('Snow showers'),
            image: rainsnowImage,
            background: "cloud"
        },
        "cloudy": {
            text: t('Cloudy'),
            image: cloudyImage,
            background: "cloud"
        },
        "lightsnowshowers": {
            text: t('Light snow showers'),
            image: rainsnowImage,
            background: "clear"
        },
        "sleet": {
            text: t('Sleet'),
            image: rainsnowImage,
            background: "cloud"
        },
        "snowshowersandthunder": {
            text: t('Snow showers and thunder'),
            image: rainsnowImage,
            background: "cloud"
        },
        "heavysleetandthunder": {
            text: t('Heavy sleet and thunder'),
            image: rainsnowImage,
            background: "cloud"
        },
        "heavysnowandthunder": {
            text: t('Heavy snow and thunder'),
            image: rainsnowImage,
            background: "cloud"
        },
        "heavyrain": {
            text: t('Heavy rain'),
            image: rainImage,
            background: "cloud"
        },
        "partlycloudy": {
            text: t('Partly cloudy'),
            image: cloudyImage,
            background: "cloud"
        },
        "lightrainshowers": {
            text: t('Light rain showers'),
            image: rainImage,
            background: "cloud"
        },
        "heavyrainshowers": {
            text: t('Heavy rain showers'),
            image: rainImage,
            background: "cloud"
        },
        "sleetshowersandthunder": {
            text: t('Sleet, showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "lightssleetshowersandthunder": {
            text: t('Light sleet, showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "lightrain": {
            text: t('Light rain'),
            image: rainImage,
            background: "cloud"
        },
        "rainshowersandthunder": {
            text: t('Rain, showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "lightsleet": {
            text: t('Light sleet'),
            image: snowImage,
            background: "cloud"
        },
        "fair": {
            text: t('Fair'),
            image: sunnyImage,
            background: "clear"
        },
        "sleetandthunder": {
            text: t('Sleet and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "lightssnowshowersandthunder": {
            text: t('Light snow showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "rainandthunder": {
            text: t('Rain and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "heavysnowshowers": {
            text: t('Heavy snow showers'),
            image: snowImage,
            background: "cloud"
        },
        "heavysleet": {
            text: t('Heavy sleet'),
            image: snowImage,
            background: "cloud"
        },
        "fog": {
            text: t('Fog'),
            image: fogImage,
            background: "cloud"
        },
        "rainshowers": {
            text: t('Rain showers'),
            image: rainImage,
            background: "cloud"
        },
        "lightsnowandthunder": {
            text: t('Light snow and thunder'),
            image: snowImage,
            background: "cloud"
        },
        "clearsky": {
            text: t('Clear'),
            image: sunnyImage,
            background: "clear"
        },
        "sleetshowers": {
            text: t('Sleet showers'),
            image: snowImage,
            background: "cloud"
        },
        "lightsleetandthunder": {
            text: t('Light sleet and thunder'),
            image: snowImage,
            background: "cloud"
        },
        "heavysnowshowersandthunder": {
            text: t('Heavy show showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "heavysleetshowers": {
            text: t('Heavy sleet showers'),
            image: snowImage,
            background: "cloud"
        },
        "heavyrainandthunder": {
            text: t('Heavy rain and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "rain": {
            text: t('Rain'),
            image: rainImage,
            background: "cloud"
        },
        "snowandthunder": {
            text: t('Snow and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "heavyrainshowersandthunder": {
            text: t('Heavy rain showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "lightrainshowersandthunder": {
            text: t('Light rain showers and thunder'),
            image: thunderImage,
            background: "cloud"
        },
        "lightsleetshowers": {
            text: t('Light sleet and showers'),
            image: snowImage,
            background: "cloud"
        },
    }

    let conditionString;
    let timeOfDay;

    if (symbol.includes("_")) {
        conditionString = symbol.substr(0, symbol.indexOf("_"));
        timeOfDay = symbol.substr(symbol.indexOf("_") + 1);
    } else {
        conditionString = symbol;
        timeOfDay = "day";
    }

    let conditionObject = codes[conditionString];
    if (timeOfDay === "night") {
        conditionObject.isNight = true;
        if (conditionObject.image === sunnyImage) conditionObject.image = moonyImage;
    }
    return conditionObject;
}

function drawSquashedText(ctx, x, y, text, fontSize, pen, maxWidth, alignCenter = true) {
    ctx.font = `${fontSize}px Contemporary`;
    ctx.fillStyle = pen;
    let metrics = ctx.measureText(text);
    metrics.height = metrics.emHeightAscent + metrics.emHeightDescent;

    let drawAt = [];
    if (alignCenter) {
        drawAt.push(x - metrics.width / 2);
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

    const yOffsetWhileWeDontHaveExtraData = 50;

    ctx.drawImage(mainData.condition.image, 100, yOffsetWhileWeDontHaveExtraData + 50);
    // drawSquashedText(ctx, 10, 45, `${mainData.temp}°`, 80, data.pen, 325, false);
    drawSquashedText(ctx, 350 / 2, yOffsetWhileWeDontHaveExtraData + 220, mainData.location.toUpperCase(), "bold 20", data.pen, 325);
    drawSquashedText(ctx, 350 / 2, yOffsetWhileWeDontHaveExtraData + 250, `${mainData.temp}° - ${t(mainData.condition.text)}`, 20, data.pen, 325);

    //Draw the five aux weather panes
    for (let i = 1; i < 6; i++) {
        let dayData = data.byTime[i];
        ctx.rotate(-Math.PI / 2);
        drawSquashedText(ctx, -((i - 1) * 82 + 41), 360, dayData.text, 20, data.pen, 72);
        ctx.rotate(Math.PI / 2);

        ctx.drawImage(dayData.condition.image, 380, (i - 1) * 82 + 9, 64, 64);
        // ctx.fillText((data.hasOwnProperty("maxTemperature") ? parseFloat(data.maxTemperature.value).toFixed() : "---") + "°", 450, (current - 1) * 82 + 30);
        // ctx.fillText((data.hasOwnProperty("minTemperature") ? parseFloat(data.minTemperature.value).toFixed() : "---") + "°", 450, (current - 1) * 82 + 60);
        drawSquashedText(ctx, 450, (i - 1) * 82 + 30, `${dayData.temp}°`, 20, data.pen, 40, false);
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
            let condition = conditionForSymbol(firstData.next_1_hours.summary.symbol_code);
            weatherData.push({
                temp: firstData.instant.details.air_temperature,
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
                    condition: conditionForSymbol(firstData.next_1_hours.summary.symbol_code),
                    temp: data.instant.details.air_temperature,
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
                    file: await weatherImage(fullWeatherData, userName, t),
                    name: "weather.png"
                }
            );
            await channel.deleteMessage(message.id);
        }
    } catch {
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

    ctx.drawImage(unavailImage, 175, 60, 150, 150);
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

//Register all the images
sunnyImage = new Canvas.Image();
fs.readFile("./modules/weather/images/sunny.png", function (err, data) {
    sunnyImage.src = data;
});

moonyImage = new Canvas.Image();
fs.readFile("./modules/weather/images/moony.png", function (err, data) {
    moonyImage.src = data;
});

cloudyImage = new Canvas.Image();
fs.readFile("./modules/weather/images/cloudy.png", function (err, data) {
    cloudyImage.src = data;
});

thunderImage = new Canvas.Image();
fs.readFile("./modules/weather/images/thunder.png", function (err, data) {
    thunderImage.src = data;
});

rainImage = new Canvas.Image();
fs.readFile("./modules/weather/images/rain.png", function (err, data) {
    rainImage.src = data;
});

windImage = new Canvas.Image();
fs.readFile("./modules/weather/images/wind.png", function (err, data) {
    windImage.src = data;
});

fogImage = new Canvas.Image();
fs.readFile("./modules/weather/images/fog.png", function (err, data) {
    fogImage.src = data;
});

pressureImage = new Canvas.Image();
fs.readFile("./modules/weather/images/pressure.png", function (err, data) {
    pressureImage.src = data;
});

humidImage = new Canvas.Image();
fs.readFile("./modules/weather/images/humidity.png", function (err, data) {
    humidImage.src = data;
});

sunsetImage = new Canvas.Image();
fs.readFile("./modules/weather/images/sunset.png", function (err, data) {
    sunsetImage.src = data;
});

sunriseImage = new Canvas.Image();
fs.readFile("./modules/weather/images/sunrise.png", function (err, data) {
    sunriseImage.src = data;
});

compassImage = new Canvas.Image();
fs.readFile("./modules/weather/images/compass.png", function (err, data) {
    compassImage.src = data;
});

snowImage = new Canvas.Image();
fs.readFile("./modules/weather/images/snow.png", function (err, data) {
    snowImage.src = data;
});

rainsnowImage = new Canvas.Image();
fs.readFile("./modules/weather/images/rainsnow.png", function (err, data) {
    rainsnowImage.src = data;
});

questionImage = new Canvas.Image();
fs.readFile("./modules/weather/images/question.png", function (err, data) {
    questionImage.src = data;
});

unavailImage = new Canvas.Image();
fs.readFile("./modules/weather/images/unavail.png", function (err, data) {
    unavailImage.src = data;
});


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
