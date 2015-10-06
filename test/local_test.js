// 'use strict';
var assert = require('assert');
    test = require('selenium-webdriver/testing'),
    // test = require('selenium-webdriver/lib/test'),
    webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
     By = webdriver.By,
    until = webdriver.until;

test.describe('Dnevnik.bg search', function() {
  test.it('should transliterate LAT->BG keyboard layout', function() {
    var options = new chrome.Options()
      .addArguments("load-extension=F:\\git\\Mudar\\src\\");

    var driver = new webdriver.Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
      // debug;
    driver.get('file:///F:/git/Mudar/test/simple%20static%20edit.html');
    driver.wait(until.elementsLocated(By.name('wordnikLoaded')), 60000);
    var searchBox = driver.findElement(By.name('test_input'));

    searchBox.sendKeys('koza ').then(function(title) {
      searchBox.getAttribute('value').then(function(value) {
        assert.equal(value, 'коза ');        
      console.log("value is:" + value);
      });
    });
    
     // driver.wait(until.titleIs('Submitted Successfully!'), 5000);
    // searchBox.getAttribute('value').then(function(value) {
    //   assert.equal(value, 'коза ');
    // });

    // driver.quit();

  });

//   test.it('should transliterate BG->LAT keyboard layout', function() {
//     var options = new chrome.Options()
//       .addArguments("load-extension=F:\\git\\Mudar\\src\\");

//     var driver = new webdriver.Builder()
//       .forBrowser('chrome')
//       .setChromeOptions(options)
//       .build();

//     driver.get('http://www.dnevnik.bg/');
//     var searchBox = driver.findElement(By.name('stext'));

//     searchBox.sendKeys('цлотх ').then(function(title) {
//       searchBox.getAttribute('value').then(function(value) {
//         assert.equal(value, 'cloth ');        
//         console.log("value is:" + value);
//       });
//     });

//     driver.quit();
//   });
});


// test.suite(function(env) {
//   var driver;
//   var options;
//   test.beforeEach(function() {
//     options = new chrome.Options()
//       .addArguments("load-extension=F:\\git\\Mudar\\src\\");
//     driver = new webdriver.Builder()
//       .forBrowser('chrome')
//       .setChromeOptions(options)
//       .build();
//   });
//   test.afterEach(function() { driver.quit(); });

//   test.describe('Dnevnik.bg search', function() {
//     test.it('should transliterate', function() {
//       driver.get('http://www.dnevnik.bg/');
//       var searchBox = driver.findElement(By.name('stext'));
//       searchBox.sendKeys('koza ').then(function(title) {
//           console.log("title is: koza:" + title);
//       });
//       // driver.wait(until.titleIs('Submitted Successfully!'), 5000);
//       searchBox.getAttribute('value').then(function(value) {
//           assert.equal(value, 'коза ');
//       });
//     });
//   });
// });
