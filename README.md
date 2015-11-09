# Mudar
prof. Vladko Mudaroff

Chrome extension for autocorrection of wrong keyboard layout. Fixes the entered word in case the user forgot to switch from English to Bulgarian input method or the other way around.


# Overview

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

