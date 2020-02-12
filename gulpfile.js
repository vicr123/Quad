const gulp = require('gulp');
const fs = require("fs");
const i18nextParser = require('i18next-parser').gulp;

let availableTranslations = fs.readdirSync("quad/translations");

gulp.task('i18next', function() {
    return gulp.src('quad/**/*.js').pipe(new i18nextParser({
        locales: availableTranslations,
        output: 'quad/translations/$LOCALE/$NAMESPACE.json',
        defaultNamespace: 'translation',
        keySeparator: false,
        namespaceSeparator: false
    })).pipe(gulp.dest('./'));
});
