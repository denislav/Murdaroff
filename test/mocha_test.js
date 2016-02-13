/**
 * The background page of the Chrome extension.
 * @namespace TestSuite
 */

var assert = require('assert'),
  test = require('selenium-webdriver/testing'),
  webdriver = require('selenium-webdriver'),
  chrome = require('selenium-webdriver/chrome'),
  By = webdriver.By,
  until = webdriver.until,
  Key = webdriver.Key,
  build = require('../src/build');

/**
 * Period to wait after input is send before checking the result of transliteration.
 * @memberof TestSuite
 * @type {integer}
 */
var transliterationDelay = 1000;

/**
 * Period for establishment of connection with Wordnik.com.
 * @memberof TestSuite
 * @type {integer}
 */
var wordnikDelay = 60000;

/**
 * Period of accepted delay for browser starting up.
 * @memberof TestSuite
 * @type {integer}
 */
var startupDelay = 5000;

/**
 * The Selenium WebDriver object.
 * @memberof TestSuite
 * @type {SeleniumWebdriver}
 */
var driver;

/**
 * The Search box element used as an input for testing.
 * @memberof TestSuite
 * @type {WebElement} 
 */
var searchBox;

/**
 * Addres of page to execute test on.
 * @memberof TestSuite
 * @type {string}
 */
var testLocation = build.isMockupTest() ?
  // var testLocation = (build !== undefined && build.mode === build.Modes.MOCKUP_TEST) ?
  __dirname + '/test.html' : 'http://www.dnevnik.bg/'

/**
 * Starts Chrome with the extension loaded.
 * @memberof TestSuite
 * @function
 * @returns {Browser} Chrome browser with loaded extension.
 */
startChrome = function() {
  var mainDirectory = __dirname.slice(0, __dirname.length - 'test'.length);
  var options = new chrome.Options()
    .addArguments('load-extension=' + mainDirectory + '/src/');
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
testInput = function(input, result) {
  driver = startChrome();
  driver.get(testLocation).then(() =>
    driver.wait(until.elementsLocated(By.name('wordnikLoaded')), wordnikDelay).then(() =>
      driver.findElement(By.name('stext')).then(searchBox =>
        searchBox.click().then(() =>
          searchBox.sendKeys(input).then(() =>
            driver.sleep(transliterationDelay).then(() =>
              searchBox.getAttribute('value').then(value => {
                var word = value.slice(value.length - input.length, value.length);
                assert.equal(word, result);
              })
            )
          )
        )
      )
    )
  );
  driver.quit();
}

/**
 * Inputs a word for transliteratoin then asserts undo is performed.
 * @memberof TestSuite
 * @function
 */
testUndo = function(input) {
  driver = startChrome();
  driver.get(testLocation).then(() =>
    driver.wait(until.elementsLocated(By.name('wordnikLoaded')), wordnikDelay).then(() =>
      driver.findElement(By.name('stext')).then(searchBox =>
        searchBox.click().then(() =>
          searchBox.sendKeys(input).then(() =>
            driver.sleep(transliterationDelay).then(() =>
              searchBox.getAttribute('value').then(transliteration => {
                assert.notEqual(transliteration, input);
                //Undo  
                searchBox.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, Key.SPACE)).then(() =>
                  searchBox.getAttribute('value').then(value =>
                    assert.equal(value, input)
                  )
                )
              })
            )
          )
        )
      )
    )
  );

  driver.quit();
}

/**
 * Inputs a word for transliteratoin in middle of a text. Check if text on left and right is untouched after transliteration.
 * @memberof TestSuite
 * @function
 */
testInMiddleOfText = function(initialText, input, result) {
  var back = Key.ARROW_LEFT;
  var words = initialText.split(' ');
  var goBack = words[words.length - 1].split('').map(c => back).join('');
  driver = startChrome();
  driver.get(testLocation).then(() =>
    driver.wait(until.elementsLocated(By.name('wordnikLoaded')), wordnikDelay).then(() =>
      driver.findElement(By.name('stext')).then(searchBox =>
        searchBox.click().then(() =>
          searchBox.sendKeys(initialText, goBack, input).then(() =>
            driver.sleep(transliterationDelay).then(() =>
              searchBox.getAttribute('value').then(value =>
                assert.equal(value, result)
              )
            )
          )
        )
      )
    )
  );
  driver.quit();
}

test.describe('Dnevnik.bg search', function() {
  this.timeout(startupDelay + wordnikDelay + transliterationDelay);

  test.it('should transliterate LAT->BG keyboard layout', function() {
    testInput('koza ', 'коза ');
  });

  test.it('should transliterate BG->LAT keyboard layout', function() {
    testInput('цлотх ', 'cloth ');
  });

  test.it('should not transliterate BG->LAT when word is in both', function() {
    testInput('цар ', 'цар ');
  });

  test.it('should not transliterate LAT->BG when word is in both', function() {
    testInput('car ', 'car ');
  });

  test.it('should not transliterate single letters in BG', function() {
    testInput('и ', 'и ');
  });

  test.it('should not transliterate single letters in EN', function() {
    testInput('I ', 'I ');
  });

  test.it('should not transliterate unknown BG words', function() {
    testInput('вщхмцкл ', 'вщхмцкл ');
  });

  test.it('should not transliterate unknown EN words', function() {
    testInput('cntrprtskl ', 'cntrprtskl ');
  });

  test.it('should undo transliteration if Ctrl+Space are pressed', function() {
    testUndo('qerewa ');
  });
  test.it('should not affect words left and right of transliterated word', function() {
    testInMiddleOfText('old tore', 'цлотх ', 'old cloth tore');
  });
});