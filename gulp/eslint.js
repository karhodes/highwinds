// GULP for eslint ******************************************

// Dependencies:
const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', function () {
	return gulp.src(['**/*.js', '!node_modules/**', '!public/**'])
		.pipe(eslint({
			extends: 'airbnb',
			ecmaFeatures: {
				modules: true,
			},
			globals: {
				$: false,
			},
			env: {
				node: true,
			},
		}))
		.pipe(eslint.format());
});

