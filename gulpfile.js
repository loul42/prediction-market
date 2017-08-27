var gulp = require('gulp'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    Promise = require('bluebird'),
    del = require('del'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less')
    babelify = require("babelify");


gulp.task('frontend:clean', () => {
    return del(['build/**/*', '!build/contracts', '!build/contracts/**/*']);
});

gulp.task('frontend:copy:lib', () => {
    return gulp.src(['app/angular.js', 'app/lib'], { base: './app' }).pipe(gulp.dest('build'));
});

gulp.task('frontend:copy:assets', () => {
    return gulp.src(['app/**/*', '!app/**/*.js', 'app/lib/**/*'], { base: './app/' })
        .pipe(gulp.dest('build'))
});
gulp.task('frontend:copy:html', () => {
    return gulp.src(['app/**/*.html'], { base: './app/' })
        .pipe(gulp.dest('build'))
});


gulp.task('frontend:compile', () => {

    return gulp.src('app/app.js')
        .pipe(browserify({
            insertGlobals: false,
            debug: true,
            transform: ['brfs', babelify.configure({
                presets: ["es2015"]
            })]
        })).on('error', (err) => {
            console.log(err.toString());
            this.emit("end");
        })
        .pipe(gulp.dest('build'))

});

gulp.task('frontend:compile:minified', () => {
    return gulp.src('app/app.js')
        .pipe(browserify({
            insertGlobals: false,
            debug: true,
            transform: ['brfs', babelify.configure({
                presets: ["es2015"]
            })]
        })).pipe(uglify().on('error', (err) => {
            console.log(err.toString());
            this.emit("end");
        }))
        .pipe(gulp.dest('build'))
});

gulp.task('frontend:less', function () {
    return gulp.src('app/**/*.less', { base: './app/' })
        .pipe(less()).on('error', (e) => {
            console.log(e);
        })
        .pipe(gulp.dest('build'));
});


gulp.task('watch', () => {
    gulp.watch("app/**/*.js", gulp.series('frontend:compile'));
    gulp.watch("app/**/*.html", gulp.series('frontend:copy:html'));
    gulp.watch("app/**/*.less", gulp.series('frontend:less'));
});


gulp.task('build:dev', gulp.series('frontend:clean', 'frontend:copy:html', 'frontend:copy:lib', 'frontend:copy:assets', 'frontend:less', 'frontend:compile'));

gulp.task('build:production', gulp.series('frontend:clean', 'frontend:copy:html', 'frontend:copy:lib', 'frontend:copy:assets', 'frontend:less', 'frontend:compile:minified'));
