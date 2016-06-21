// GULP for JS ******************************************

// Dependencies:
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const ngAnnotate = require('gulp-ng-annotate');
const plumber = require('gulp-plumber');

// JS Build (Called in gulpfile):
gulp.task('js:build', function () {
  return gulp.src(['js/*.js'])
    .pipe(plumber())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js'));
});

// JS Watch (Called in gulpfile):
gulp.task('js:watch', ['js:build'], function () {
  gulp.watch(['js/*.js'], ['js:build']);
});
