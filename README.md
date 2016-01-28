# Mudar
prof. Vladko Murdaroff

Chrome extension for autocorrection of wrong keyboard layout. Fixes the entered word in case the user forgot to switch from English to Bulgarian input method or the other way around.


## Overview

The extension is trying to check every word that a browser user is typing and correct it if the entered word seems wrong. 

The "transliteration" occurs only if the entered word is not present in the language of origin but are present in the other language. The assumption is that words in latin are English words and words in cyrilic are Bulgarian.

Note: 
# Example

"koza" -> "коза" 

or 

"цлотх" -> "cloth"


# Undo

User can undo the last transliteration using Ctrl+Space in case Vladko is is wrong or if the user does not want transliteration of the word

"I am ivan" --Space--> "I am иван " --Ctrl+Shift+Space--> "I am ivan "

# Dictionaries

For checking of English words the extension is using Wordnik.com. You can check the API at developer.wordnik.com.
There is a delay around 30 seconds before connection to Wordnik is established. To tackle this problem, permissions:background is used in manifest.json so connection should be established at computer startup.

For Bulgarian words there are two sources used to compile a Bulgarian dictionary. One is a dictionary collected by my brother Aleksandar Savkov https://github.com/savkov . The other is compiled by Hermit Dave using the opensubtitles.org database and can be downloaded from https://invokeit.wordpress.com/frequency-word-lists/


## Installation

After cloning the repository you need to build the extension by running the build Grunt task

...
grunt build
...

Which generates background.js using Browserify.

Load the unpacked extension from the ./src folder.

# Development 

First you need to e familiar with the structure of a Chrome extension.

Background.js = background_origin.js + Swagger + dictionary // using Browserify

Make changes in background_origin.js then build to update Background.js
Swagger is used to access Wordnik.
The bulgarian dictionary is in separate file because is slowing down the IDE/text editor.

# Tests

You can execute some automated Selenium-webdriver tests by running the Grunt task

...
grunt test
...

See and add more tasks in the ./Grunt.js file. There is also watch tasks to automate execution upon save.

Note that Wordnik services takes 20-30 seconds to initialize which is not practical for continuous integration tests. A future development task is to make a Wordnik mockup to allow instant tests.

# Documentation

Currently Grunt jsdoc task is not working. Use command line to generate jsdoc.

...
jsdoc ./src/vladko.js ./src/background_origin.js ./test/mocha_test.js -d ./docs
...