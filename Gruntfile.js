module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-gh-pages');

    var files = {
        demo: ['demo/**/*.js'],
        lib: ['lib/**/*.js'],
        test: ['test/**/*.js'],
        build: ['Gruntfile.js']
    };

    files.all = [].concat(files.demo, files.test, files.lib, files.build);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                ignores: "**/*.min.js"
            },
            all: files.all
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'dot',
                    clearRequireCache: true
                },
                src: files.test
            }
        },
        browserify: {
            standalone: {
                options: {
                    browserifyOptions: {
                        standalone: '<%= pkg.name %>'
                    }
                },
                dest: 'dest/<%= pkg.name %>.js',
                src: files.lib
            },
            demo: {
                dest: 'demo/app.min.js',
                src: 'demo/app.js'
            }
        },
        uglify: {
            demo: {
                files: {
                    'demo/app.min.js': ['demo/app.min.js']
                }
            },
            dest: {
                files: {
                    'dest/<%= pkg.name %>.min.js': ['dest/<%= pkg.name %>.js']
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'demo'
            },
            src: ['**']
        },
        watch: {
            test: {
                files: files.all,
                tasks: [ 'jshint', 'mochaTest' ]
            },
            build: {
                options: {
                    spawn: false
                },
                files: files.demo.concat(files.lib),
                tasks: [ 'browserify' ]
            }
        }
    });

    // run only changed tests when saving test files
    var defaultTestSrc = grunt.config('mochaTest.test.src');
    grunt.event.on('watch', function(action, filepath) {
        grunt.config('mochaTest.test.src', defaultTestSrc);
        if (filepath.match('test/')) {
            grunt.config('mochaTest.test.src', filepath);
        }
    });

    grunt.registerTask('test', [ 'jshint', 'mochaTest' ]);

    grunt.registerTask('package', [ 'browserify', 'uglify' ]);

    grunt.registerTask('default', [ 'test', 'package' ]);

    grunt.registerTask('publish', [ 'package', 'gh-pages' ]);
};
