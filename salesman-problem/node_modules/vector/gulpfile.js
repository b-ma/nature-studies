var gulp        = require('gulp')
  , browserify  = require('browserify')
  , source      = require('vinyl-source-stream')
  , streamify   = require('gulp-streamify')
  , uglify      = require('gulp-uglify')
  , rename      = require('gulp-rename')
;

var globalName = 'Vector';
var root = '.';
var dist = root + '/dist';
var filename = 'vector';
var paths = {
    scripts: '**/*.js'
}

gulp.task('browserify', function() {
    var bundleStream = browserify(root + '/index.js', {
        // debug: true,
        standalone: globalName
    }).bundle();

    bundleStream
        .pipe(source(filename + '.js'))
        .pipe(gulp.dest(dist))
        .pipe(rename(filename + '.min.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(dist));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['browserify']);
});

// default task
gulp.task('default', ['watch', 'browserify']);