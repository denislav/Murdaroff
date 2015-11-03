// 'use strict';
var assert = require('assert');
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
     By = webdriver.By,
    until = webdriver.until;

/**
* The background page of the Chrome extension.
* @namespace TestSuite
*/

/**
* Period to wait after input is send before checking the result.
* @memberof TestSuite
* @type {integer}
*/
var transliterationDelay = 500;

/**
* Period for establishment of connection with Wordnik.com.
* @memberof TestSuite
* @member
* @type {integer}
*/
var wordnikDelay = 60000;

/**
* Period of accepted delay for browser starting up.
* @memberof TestSuite
* @member
* @type {integer}
*/
var startupDelay = 5000;

/**
* The Selenium WebDriver object.
* @memberof TestSuite
* @member
*/
var driver;

/**
* The Search box element used as an input for testing.
* @memberof TestSuite
* @member
*/
var searchBox;


/**
* Starts Chrome with the extension loaded.
* @memberof TestSuite
* @function
*/
startChrome = function(){
    var options = new chrome.Options()
      .addArguments("load-extension=F:\\git\\Mudar\\src\\");
    return new webdriver.Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
}

/**
* Inputs a word on a online website and asserts the expeceted result
* @memberof TestSuite
* @function
*/
setupAndInput = function(input,result){
  driver = startChrome();    

  driver.get('http://www.dnevnik.bg/');

  driver.wait(until.elementsLocated(By.name('wordnikLoaded')), wordnikDelay);

  searchBox = driver.findElement(By.name('stext'));

  searchBox.sendKeys(input + ' ').then(function(title) {
    driver.sleep(transliterationDelay);
    searchBox.getAttribute('value').then(function(value) {
        var words = value.split(" ");
        var wordCount = words.length;
        var word = words[wordCount - 2];
        assert.equal(word, result);        
      console.log("value is:" + word);
    });
  });
}

/**
* Inputs a word on a online website and asserts the expeceted result
* @memberof TestSuite
* @function
*/
dnevnikInput = function(input,result){
  setupAndInput(input,result);
  driver.quit();    
}

/**
* Inputs a word for transliteratoin then asserts undo is performed.
* @memberof TestSuite
* @function
*/
dnevnikInputUndo = function(){
  setupAndInput('koza','коза');
  
  //Undo
  searchBox.sendKeys(webdriver.Key.CONTROL,' ').then(function(title) {
    driver.sleep(transliterationDelay);
    searchBox.getAttribute('value').then(function(value) {
        var words = value.split(" ");
        var wordCount = words.length;
        var word = words[wordCount - 2];
        assert.equal(word, 'koza');        
      console.log("value is:" + word);
    });
  });

  driver.quit();    
}

test.describe('Dnevnik.bg search', function() {
  this.timeout( startupDelay + wordnikDelay + transliterationDelay );
  
  test.it('should transliterate LAT->BG keyboard layout', function() {
    dnevnikInput('koza','коза');
  });
  
  test.it('should transliterate BG->LAT keyboard layout', function() {
    dnevnikInput('цлотх','cloth');
  });

  test.it('should not transliterate BG->LAT when word is in both', function() {
     dnevnikInput('цар','цар'); 
  });

  test.it('should not transliterate LAT->BG when word is in both', function() {
     dnevnikInput('car','car'); 
  });

  test.it('should undo transliteration if Ctrl+Space are pressed', function() {
     dnevnikInputUndo(); 
  });

});