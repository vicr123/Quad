const gulp = require('gulp');
const fs = require("fs");
const i18nextParser = require('i18next-parser').gulp;
const webpack = require('webpack-stream');

let availableTranslations = fs.readdirSync("quad/translations");

function i18next() {
    return gulp.src('quad/**/*.js')
        .pipe(new i18nextParser({
            locales: availableTranslations,
            output: 'quad/translations/$LOCALE/$NAMESPACE.json',
            defaultNamespace: 'translation',
            keySeparator: false,
            namespaceSeparator: false
        }))
        .pipe(gulp.dest('./'));
}

function quadweb() {
    return gulp.src('quadweb/src/index.jsx')
        .pipe(webpack(require('./quadweb/webpack.config.js')))
        .pipe(gulp.dest('quadweb/dist'))
}

module.exports = {
    i18next: i18next,
    quadweb: quadweb,
    install: require('./install'),
    default: gulp.parallel(i18next, quadweb)
};