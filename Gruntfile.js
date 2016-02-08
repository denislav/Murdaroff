module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      browserify: {
        files: [
          'src/background_origin.js',
          'test/swagger_mockup.js',
          'src/build.js',
          'res/bg_dictionary.js'
        ],
        tasks: ['browserify']
      },
      buildTest: {
        files: ['src/*.js', 'test/*.js'],
        tasks: ['build', 'test']
      }
    },
    jsdoc: {
      basic: {
        src: [
          'readme.md',
          'src/background_origin.js',
          'src/vladko.js',
          'src/build.js',
          'test/swagger_mockup.js',
          'test/mocha_test.js',
          'res/bg_dictionary.js'
        ],
        options: {
          destination: 'doc'
        }
      }
    },
    browserify: {
      dist: {
        src: ['src/background_origin.js'],
        dest: 'src/background.js'
      }
    },
    mochaTest: {
      test: {
        options: {
          captureFile: 'test/result.log',
        },
        src: ['test/mocha_test.js']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-selenium-webdriver');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-jsdoc');


  grunt.registerTask('build', ['browserify']);
  grunt.registerTask('watchBuild', ['watch:browserify']);
  grunt.registerTask('watchTest', ['watch:buildTest']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('doc', ['jsdoc:basic']);
  grunt.registerTask('default', ['build', 'test', 'doc']);

};