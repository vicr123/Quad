const fs = require('fs');
const Canvas = require('canvas');

let t = str => str;

let sunnyImage, moonyImage, cloudyImage, thunderImage, rainImage, windImage, fogImage, humidImage, pressureImage, sunriseImage, sunsetImage, compassImage, snowImage, rainsnowImage, questionImage, unavailImage, manImage;

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

module.exports = {
    conditionForSymbol: conditionForSymbol,
    manImage: () => {
        return manImage
    },
    unavailImage: () => {
        return unavailImage
    }
}