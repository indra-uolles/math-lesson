var gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    coffee = require('gulp-coffee'),
    gutil = require('gulp-util');

gulp.task('css', function() {
    gulp.src('./src/css/*.css')
        .pipe(concat('main.css'))
        .pipe(prefix(['> 1%', 'Opera > 1%', 'Safari > 1%', 'Firefox > 1%', 'Explorer > 1%', 'Chrome > 1%'], { cascade: true }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('coffee', function() {
    return gulp.src(['./src/coffee/*.coffee'])
        .pipe(concat('main.coffee'))
        .pipe(gulp.dest('dist'))
        .pipe(coffee({
            bare: true,
            sourceMap: true
        }).on('error', gutil.log))
        //.uglify()
        .pipe(gulp.dest('dist'))
});


gulp.task('default', ['css', 'coffee'], function() {
    gulp.watch('./src/js/*.js', ['coffee']);
    gulp.watch('./src/css/*.css', ['css']);
});

