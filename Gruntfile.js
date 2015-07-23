module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
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
            'public/cuttle.min.js': files.lib
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

    grunt.registerTask('default', [ 'jshint', 'mochaTest', 'browserify' ]);

    grunt.registerTask('publish', [ 'browserify', 'gh-pages' ]);
};
