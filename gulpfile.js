'use strict';

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      plumber = require('gulp-plumber');

let styles = {
    input: './source_web/sass/styles.scss',
    output: './source_web/css'
};

let onError = function(err) {
    console.log(err.toString());
    this.emit('end');
};

gulp.task('styles', function() {
    return gulp
        // Find all `.scss` files from the `stylesheets` folder
        .src(styles.input)
        // Plumber eventual errors
        .pipe(plumber({
            errorHandler: onError
        }))
        // Run Sass on those files
        .pipe(sass())
        // Write the resulting CSS in the output folder
        .pipe(gulp.dest(styles.output));
});

gulp.task('watch', function() {
    // CSS
    gulp.watch('source_web/sass/**/*.scss', ['styles']);
});


// Watch task
gulp.task('default', ['watch']);