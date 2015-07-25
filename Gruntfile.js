module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-gh-pages');

    var files = {
        lib: ['lib/**/*.js'],
        test: ['test/**/*.js'],
        build: ['Gruntfile.js']
    };

    files.all = [].concat(files.test, files.lib, files.build);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
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
                dest: 'public/<%= pkg.name %>.js',
                src: files.lib
            }
        },
        uglify: {
            all: {
                files: {
                    'public/<%= pkg.name %>.min.js': ['public/<%= pkg.name %>.js']
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'public'
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
                files: files.lib,
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

    grunt.registerTask('package', [ 'browserify', 'uglify' ]);

    grunt.registerTask('default', [ 'jshint', 'mochaTest', 'package' ]);

    grunt.registerTask('publish', [ 'package', 'gh-pages' ]);
};
