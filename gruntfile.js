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
                    style: 'expanded',
                    trace: true,
                    sourcemap: true,
                    precision: 4
                },
                files: {
                    '<%= pkg.directories.src_css %>/styles.css': '<%= pkg.directories.src_sass %>/styles.sass'
                }
            },
            deploy: {
                options: {
                    style: 'compressed',
                    trace: true,
                    sourcemap: true,
                    precision: 4
                },
                files: {
                    '<%= pkg.directories.build_css %>/styles.min.css': '<%= pkg.directories.src_sass %>/styles.sass'
                }
            }
        },

        /*
         * RequireJS optimization
         */
        requirejs: {
            compile: {
                options: {
                    wrap: true,
                    almond: true,
                    appDir: '<%= pkg.directories.src_js %>',
                    dir: '<%= pkg.directories.build_js %>',
                    baseUrl: './',
                    keepBuildDir: true,
                    preserveLicenseComments: false,
                    skipDirOptimize: false,
                    normalizeDirDefines: "skip",
                    removeCombined: true,
                    mainConfigFile: '<%= pkg.directories.src_js %>/config.js',
                    paths: {
                        almond: 'vendor/almond-0.2.9'
                    },
                    modules: [
                        {
                            name: 'script-<%= pkg.version %>.min',
                            include: ['almond', 'main'],
                            create: true
                        }
                    ]
                }
            }
        },

        /*
         * Process HTML
         */
        processhtml: {
            options: {

            },
            dist: {
                files: {
                    '<%= pkg.directories.build %>/index.html': '<%= pkg.directories.src %>/index.html'
                }
            }
        },

        /*
         * Copy static files
         */
        copy: {
            photos: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= pkg.directories.src %>/static/photos',
                        src: ['**'],
                        dest: '<%= pkg.directories.build %>/static/photos'},
                ]
            },
            data: {
                files: [
                    {
                        src: '<%= pkg.directories.src %>/data/memories.json',
                        dest: '<%= pkg.directories.build %>/data/memories.json'
                    }
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-processhtml');

    grunt.registerTask('default', ['watch:sass']);
    grunt.registerTask('deploy', ['sass:deploy','requirejs', 'processhtml', 'copy:photos', 'copy:data']);
};
