var gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-minify-css'),
    uglify = require('gulp-uglify');

gulp.task('css', function() {
    gulp.src('./src/css/*.css')
        .pipe(concat('main.css'))
        .pipe(prefix(['> 1%', 'Opera > 1%', 'Safari > 1%', 'Firefox > 1%', 'Explorer > 1%', 'Chrome > 1%'], { cascade: true }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('js', function() {
  gulp.src(['./src/js/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
});

gulp.task('default', ['css', 'js'], function() {
    gulp.watch('./src/js/*.js', function() {
        gulp.run('js');
    });
 
    gulp.watch('./src/css/*.css', function() {
        gulp.run('css');
    });
});

