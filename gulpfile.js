const gulp = require('gulp');
const i18nextParser = require('i18next-parser').gulp;

gulp.task('i18next', function() {
    return gulp.src('quad/**/*.js').pipe(new i18nextParser({
        locales: ['en'],
        output: 'quad/translations/$LOCALE/$NAMESPACE.json',
        defaultNamespace: 'translation',
        keySeparator: false,
        namespaceSeparator: false
    })).pipe(gulp.dest('./'));
});
