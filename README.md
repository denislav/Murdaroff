# Murdaroff - The Smart Transliterator

Chrome extension for autocorrection of input from wrong keyboard layout. Fixes the entered word in case the user forgot to switch from English to Bulgarian input method or the other way around. [Install from Chrome Webstore.](https://chrome.google.com/webstore/detail/murdaroff-the-smart-trans/cgcgjpklfadfjcnnhmochjloidpjaopi?hl=bg&gl=BG)

## Overview

The extension is trying to check every word that a browser user is typing and correct it if the entered word seems wrong. 

The "transliteration" occurs only if the entered word is not present in the language of origin but are present in the other language. The assumption is that words in latin are English words and words in cyrilic are Bulgarian.

Note: 
### Example

"koza" -> "коза" 

or 

"цлотх" -> "cloth"


### Undo

User can undo the last transliteration using Ctrl+Space in case Vladko is is wrong or if the user does not want transliteration of the word

"I am ivan" --Space--> "I am иван " --Ctrl+Shift+Space--> "I am ivan "

### Dictionaries

For checking of English words the extension is using Wordnik.com. You can check the API at developer.wordnik.com.
There is a delay around 30 seconds before connection to Wordnik is established. To tackle this problem, permissions:background is used in manifest.json so connection should be established at computer startup.

For Bulgarian words there are two sources used to compile a Bulgarian dictionary. One is a dictionary collected by my brother Aleksandar Savkov https://github.com/savkov . The other is compiled by Hermit Dave using the opensubtitles.org database and can be downloaded from https://invokeit.wordpress.com/frequency-word-lists/


## Installation

After cloning the repository you need to build the background.js with Browserify by running the build Grunt task

```
grunt build
```

Now you can load the (unpacked) extension from the ./src folder.

### Development 

First you need to be familiar with the structure of a Chrome extension.

Background.js = background_origin.js + Swagger + dictionary + build mode

Background.js has several sources so it needs to be rebuilt uppon any changes in the sources. There is a automatic task upon file change.

```
grunt watchBuild
```

Swagger is used to access Wordnik dictionary service.

The bulgarian dictionary is in separate file because is slowing down the IDE/text editor. 

### Tests

You can execute some automated Selenium-webdriver tests by running the Grunt task

```
grunt test
```
or
```
grunt watchTest
```
to execute upon save.

### Build modes

There are 3 build modes - PRODUCTION, LIVE_TEST and MOCKUP_TEST

#### MOCKUP_TEST

Note that Wordnik services takes 20-30 seconds to initialize which is not practical for TDD. Because of this there is a mockup of Wordnik which is activated by changing the mode value in build.js. Furthermore, in this mode a local test html page is used for fast testing speed.

#### LIVE_TEST

This is the more realistic test which connects to Wordnik and uses an internet page to test extension.

### Documentation

To generate documentation run the grunt task

```
grunt doc
```

## TO DO

Some things that need to be done

* Make reusable asynchronous test methods using Promises to escape current callback hell
* There is a functional issue in case of fast typing - get the cursor before replacing text instead on "Space" event
* Improve the coding style - many statics are used, update to ECMA6
* Documentation not covering 100% of code.
* Add case insensitive transliteration (ex. Цлотх)
* Improve undo blocking condition - compare text content

