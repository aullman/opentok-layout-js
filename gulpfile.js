var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    Server = require('karma').Server;

gulp.task('default', function(){
    gulp.src('./opentok-layout.js')
        .pipe(jshint())
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename('opentok-layout.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('test', function (done) {
  // Run tests without jQuery
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: ['Firefox'],
    // list of files / patterns to load in the browser
    files: [
      'https://static.opentok.com/v2/js/opentok.js',
      'opentok-layout.js',
      'tests/**/*spec.js'
    ],
    singleRun: true
  }, done).start();
});
