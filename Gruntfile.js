module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          reporter: 'dot',
          clearRequireCache: true
        },
        src: ['test/**/*.js']
      }
    },
    browserify: {
      'public/app.js': ['lib/main.js']
    },
    watch: {
      files: [ 'lib/**/*.js', 'test/**/*.js' ],
      tasks: [ 'default' ]
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

  grunt.registerTask('default', [ 'mochaTest', 'browserify' ]);
};
