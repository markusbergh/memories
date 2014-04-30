/*
 * These are my memories Grunt Configuration
 * This file contains the configuration for GruntJS.
 *
 * Author:
 * Markus Bergh, 2014
 */

module.exports = function(grunt) {
    // Grunt configuration
    grunt.initConfig({

        /*
         * Package
         */
        pkg: grunt.file.readJSON('package.json'),

        /*
         * Banner
         */
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ',



        /*
         * Watch SASS directories
         */
        watch: {
            sass: {
                files: ['<%= pkg.directories.src_sass %>/**/*.sass'],
                tasks: ['sass:dev']
            }
        },

        /*
         * SASS compiler
         */
        sass: {
            dev: {
                options: {
                    style: 'compressed',
                    trace: true,
                    sourcemap: true,
                    precision: 4
                },
                files: {
                    '<%= pkg.directories.src_css %>/styles.min.css': '<%= pkg.directories.src_sass %>/styles.sass'
                }
            }
        },

        /*
         * JS minifier
         */
        uglify: {
            target: {
                files: {
                    '<%= pkg.directories.src_js %>/script.min.js': ['<%= pkg.directories.src_js %>/1984/modules/1984__utils.js',
                                                                    '<%= pkg.directories.src_js %>/1984/modules/1984__registerUser.js',
                                                                    '<%= pkg.directories.src_js %>/1984/modules/1984__map.js',
                                                                    '<%= pkg.directories.src_js %>/1984/modules/1984__reveal.js',
                                                                    '<%= pkg.directories.src_js %>/1984/modules/1984__svg.js',
                                                                    '<%= pkg.directories.src_js %>/1984/modules/1984__navigation.js',
                                                                    '<%= pkg.directories.src_js %>/1984/1984.js',
                                                                    '<%= pkg.directories.src_js %>/main.js', ]
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch:sass']);
};
