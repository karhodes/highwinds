// GULP for CSS ******************************************

// Dependencies
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

// Setting up SASS, linking bootstrap
gulp.task('cssBuild', function () { 
	return gulp.src('sass/*.scss', {
		style: 'compressed',
			loadPath: [
				'./sass'
			],
	}) 
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('./public/css')); 
});

// CSS Build (Called in gulpfile):
gulp.task('css:build', ['cssBuild']);

// CSS Watch (Called in gulpfile):
gulp.task('css:watch', ['css:build'], function () {
	gulp.watch('sass/**/*.scss', ['css:build']);
});
