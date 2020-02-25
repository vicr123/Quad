const gulp = require('gulp');
const fs = require("fs");
const i18nextParser = require('i18next-parser').gulp;
const webpack = require('webpack-stream');

let availableTranslations = fs.readdirSync("quad/translations");

gulp.task('i18next', function() {
    return gulp.src('quad/**/*.js')
        .pipe(new i18nextParser({
            locales: availableTranslations,
            output: 'quad/translations/$LOCALE/$NAMESPACE.json',
            defaultNamespace: 'translation',
            keySeparator: false,
            namespaceSeparator: false
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('quadweb', function() {
    return gulp.src('quadweb/src/index.jsx')
        .pipe(webpack(require('./quadweb/webpack.config.js')))
        .pipe(gulp.dest('quadweb/dist'))
});