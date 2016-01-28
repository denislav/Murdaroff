module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webdriver: {
      //vladko: {
      options: {
        desiredCapabilities: {
          browserName: 'chrome'
        }
      },
      onlineTest:{
  	    tests: 'test/mocha_test.js'
      },
      local:{
        tests: 'test/local_test.js'
      }
      //}
    },
    watch: {
      browserify: {            
          files: ['src/background_origin.js'],
          tasks: ['browserify']
      },
      runTest: {
        files: ['src/*.js', 'test/*.js'],
        tasks: ['test']
      }
    },
    jsdoc : {
      dist : {
        src: ['src/*.js', 'test/*.js','readme.md'],
        //src: ['src/background_origin.js'],
        options: {
          destination: 'docs'
        }
      }
    },
    browserify:{
      dist: {
        src: ['src/background_origin.js'],
        dest: 'src/background.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-selenium-webdriver');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-webdriver');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('devTestVladko', ['webdriver:local']);
  grunt.registerTask('devTest', ['browserify','webdriver:onlineTest']);
  grunt.registerTask('devTestOnline', ['browserify','webdriver:onlineTest']);
  grunt.registerTask('test', ['webdriver:onlineTest']);

  grunt.registerTask('build', ['browserify','jsdoc']);
  //grunt.registerTask('watchDev', ['watch:dev']);
  grunt.registerTask('watchBrowserify', ['watch:browserify']);
  grunt.registerTask('watchTest', ['watch:runTest']);
  grunt.registerTask('default', ['watch']);

};
