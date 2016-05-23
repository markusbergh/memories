'use strict';

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      webpack = require('webpack'),
      webpackStream = require('webpack-stream'),
      plumber = require('gulp-plumber'),
      cssmin = require('gulp-cssmin');

let styles = {
    input: './source_web/sass/styles.scss',
    output: './source_web/static/css'
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
        // Minify CSS
        .pipe(cssmin())
        // Write the resulting CSS in the output folder
        .pipe(gulp.dest(styles.output));
});

gulp.task('webpack', function() {
    return gulp
        .src('./source_web/js/main.js')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(webpackStream({
            resolve: {
                modulesDirectories: ['node_modules', './source_web/js'],
            },
            module: {
                loaders: [
                    {
                        test: /\.js$/,
                        loader: 'babel',
                        exclude: /node_modules/,
                        query: {
                            cacheDirectory: true,
                            presets: ['es2015']
                        }
                    },
                    {
                        test: require.resolve('snapsvg'),
                        loader: 'imports-loader?this=>window,fix=>module.exports=0'
                    },
                    {
                        test: require.resolve('jquery.transit'),
                        loader: 'imports-loader?this=>window,fix=>module.exports=0'
                    },
                    {
                        test: require.resolve('masonry-layout'),
                        loader: 'imports-loader?define=>false&this=>window'
                    },
                    {
                        test: /jquery\.js$/,
                        loader: 'expose-loader?$'
                    },
                    {
                        test: /jquery\.js$/,
                        loader: 'expose-loader?jQuery'
                    }
                ]
            },
            devtool: 'eval',
            watch: true,
            output: {
                filename: 'script.min.js'
            },
            plugins: [
                new webpack.optimize.UglifyJsPlugin({
                    minimize: false,
                    compress: {
                        warnings: false
                    }
                })
            ]
        }))
        .pipe(gulp.dest('./source_web/static/js/'));
});

gulp.task('watch', function() {
    // CSS
    gulp.watch('source_web/sass/**/*.scss', ['styles']);

    // JavaScript
    gulp.watch('source_web/js/**/*.js', ['webpack']);
});

// Watch task
gulp.task('default', ['watch']);