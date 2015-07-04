module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          reporter: 'dot'
        },
        src: ['test/**/*.js']
      }
    },
    browserify: {
      'public/app.js': ['lib/main.js']
    },
    watch: {
      files: [ "lib/**/*.js"],
      tasks: [ 'browserify' ]
    }
  });

  grunt.registerTask('default', [ 'mochaTest', 'browserify' ]);
};
