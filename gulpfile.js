// Main gulpfile  ******************************************
const fs = require('fs');
const gulp = require('gulp');
const bower = require('gulp-bower');

// Run bower to update front end dependencies
gulp.task('bower', function () {
  return bower('./bower_components')
  .pipe(gulp.dest('./public/bower'));
});

fs.readdirSync('./gulp').forEach(function (module) {
  require('./gulp/' + module);
});

// Calling the tasks built in the modules in the gulp folder
gulp.task('build', ['bower', 'js:build', 'css:build']);
gulp.task('watch', ['bower', 'js:watch', 'css:watch']);
// gulp.task('default', ['watch', 'server', 'lint']);
gulp.task('default', ['watch']);
