var webdriver = require('selenium-webdriver');
 var chrome = require('selenium-webdriver/chrome');

 var options = new chrome.Options()
  .addArguments("load-extension=F:\\git\\Mudar\\src");

 var service = new chrome.ServiceBuilder()
     .build();

var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  By = webdriver.By;
  until = webdriver.until;
  
driver.get('http://www.dnevnik.bg/');
var edit = driver.findElement(By.name('stext'));

edit.sendKeys('koza ');
edit.getAttribute('value').then(function(value) {
 console.log(value === 'коза ');
});
  // console.log( );
// driver.findElement(By.name('btnG')).click();
// driver.wait(until.titleIs('webdriver - Google Search'), 5000);
// driver.quit();
console.log('Test finish');
