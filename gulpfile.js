// Main gulpfile  ******************************************
const fs = require('fs');
const gulp = require('gulp');

fs.readdirSync('./gulp').forEach(function (module) {
  require('./gulp/' + module);
});

// Calling the tasks built in the modules in the gulp folder
gulp.task('build', ['js:build', 'css:build']);
gulp.task('watch', ['js:watch', 'css:watch']);
// gulp.task('default', ['watch', 'server', 'lint']);
gulp.task('default', ['watch']);
