const gulp = require('gulp');
const install = require('gulp-install');
const fs = require('fs');
const util = require('util');

let outputDir = "/";
if (process.env["DESTDIR"]) outputDir = process.env["DESTDIR"];
const baseDir = `${outputDir}/opt/quad`;
const binDir = `${outputDir}/usr/bin/`;

const fsLink = async (existingPath, newPath) => {
    try {
        await util.promisify(fs.link)(existingPath, newPath);
    } catch (err) {
        //Don't worry
    }
}

function copy() {
    return gulp.src(["package.json", "package-lock.json", "quad/**", "quadctl/**", "quadsrv/**", "quadweb/**"], {
        base: "."
    })
        .pipe(gulp.dest(baseDir))
}

function copyDistfiles() {
    return gulp.src("dist/**", {
        base: "dist"
    })
        .pipe(gulp.dest(outputDir))
}

function installNpm() {
    return gulp.src(`${baseDir}/package.json`)
        .pipe(gulp.dest(baseDir))
        .pipe(install({
            production: true
        }));
}


module.exports = gulp.parallel(
    gulp.series(
        copy,
        installNpm
    ),
    copyDistfiles
);