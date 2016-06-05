var gulp    = require('gulp'),
    uglify  = require('gulp-uglify');
var del     = require('del');
var minifyHTML = require('gulp-minify-html');
var karma = require('karma').server;

gulp.task('minify', function () {
  gulp.src('assets/js/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('minified'));

  gulp.src('./index.html')
    .pipe(minifyHTML())
    .pipe(gulp.dest('./minified/'))

  gulp.src('assets/css/*.css')
   .pipe(minifyCSS({keepBreaks:true}))
   .pipe(gulp.dest('./minified/'))
});

gulp.task('clean', function(cb) {
  del(['minified/*'], cb);
});

gulp.task('tests', function(done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function() {
        done();
    });
});

gulp.task('default', ['tests']);