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
	           allTest:{
	    	      tests: 'test/mocha_test.js'
	           },
             local:{
              tests: 'test/local_test.js'
             }
          //}
        },
        watch: {
          all: {
            files: ['src/*.js', 'test/*.js'],
            tasks: ['devTest']
          },
          browserify: {
            files: ['src/background_origin.js'],
            tasks: ['browserify']
          }
        },
        jsdoc : {
          dist : {
            src: ['src/*.js', 'test/*.js','readme.md'],
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
  grunt.registerTask('devTest', ['browserify','webdriver:allTest']);
  grunt.registerTask('devTestAll', ['browserify','webdriver:allTest']);
  grunt.registerTask('test', ['webdriver']);

  grunt.registerTask('build', ['browserify','jsdoc']);
  //, function() {    grunt.log.write('Logging some stuff...').ok();  }
  //grunt.registerTask('watchDev', ['watch:dev']);
  grunt.registerTask('watchBrowserify', ['watch:browserify']);
  grunt.registerTask('default', ['watch:all']);

};
