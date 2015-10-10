// 'use strict';

var client = require('swagger-client');
var rechko = require('../res/bg_dictionary');

/**
* The background page of the Chrome extension.
* @namespace Background
*/

/**
* Supported keyboard layouts
* @memberof Background
* @enum
*/
var keyboardLayout = {
    LATIN:0,
    CYRILIC:1
};

/**
* Flag indicating if connection to Wordnik is set up and ready to transmitting requests.
* @memberof Background
* @member 
* @type {boolean}
*/
var wordnikLoaded = false;
var swagger = new client({
	url: 'http://api.wordnik.com:80/v4/word.json',
	success: function() {
    		swagger.word.getDefinitions({word:'carses', limit:1, sourceDictionaries:'all'},{responseContentType: 'application/json'},function(response){
    		console.log(response.obj[0]===undefined? "carses doesn't exist" : response.obj[0].word + ' exists ' ); // + response.obj.searchResults[0].count + ' times in the repository');
      		console.log('=== response ===');
      		wordnikLoaded = true;
			chrome.tabs.query({}, function(tabs){
				for (var i = 0; i < tabs.length; i++) {				 
				 	chrome.tabs.sendMessage(
				    	tabs[i].id,
				    	{	
				    		wordnikLoaded : wordnikLoaded
				    	},
						logWordnikLoad		    	
			    	);  
				}			    
			});
    });
  }
});
swagger.clientAuthorizations.add('apiKey', new client.ApiKeyAuthorization('api_key','eddc3027033322a3a96080687ee0d8fab8ba52dca55e97dae','query'));
function logWordnikLoad(response) {
	console.log('wordnik loaded aknowledged');
}

/**
* Decides which is the keyboard layout of the input text.
* @memberof Background
* @param {string} Input word to get keyboard layout from.
* @returns {keyboardLayout}	Enumeration value of the keyboard layout used to write this word.
*/
function getAlphabet(word) {
    if (word.charCodeAt(0) < 1000) // Need to make the interval narrow and add not alphabet result
        return keyboardLayout.LATIN;
    else 
        return keyboardLayout.CYRILIC;
}

/**
* Represents Latin keyboard layout as a string array.
* @memberof Background
* @const
*/
var LATIN_KEYBOARD = "`qwertyuiop[]\\asdfghjkl;'zxcvbnm,./" + 'QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?';
/**
* Represents Cyrilic keyboard layout as a string array.
* @memberof Background
* @const
*/
var CYRILIC_KEYBOARD = "ючшертъуиопящьасдфгхйкл;'зжцвбнм,./" + 'ЮЧШЕРТЪУИОПЯЩѝАСДФГХЙКЛ:"ЗЖЦВБНМ„“?';

/**
* Converts word from Latin keyboard layout to Cyrilic keyboard layout.
* @memberof Background
* @function
* @param {string} word - Input word in Latin
* @returns {string} Word converted to Cyrilic keyboard layout
*/
function latinToCyrilic(word) {
    return word.split('').map(function (char) {
        var index = LATIN_KEYBOARD.indexOf(char);
        return CYRILIC_KEYBOARD.charAt(index);
    } ).join('');
}

/**
* Converts word from Cyrilic keyboard layout to Latin keyboard layout.
* @memberof Background
* @function
* @param {string} word - Input word in Cyrilic
* @returns {string} Word converted to Latin keyboard layout
*/
function cyrilictToLatin(word) {
    return word.split('').map(function (char) {
        var index = CYRILIC_KEYBOARD.indexOf(char);
        return LATIN_KEYBOARD.charAt(index);
    } ).join('');
}

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.message == 'isWordnikLoaded')
			sendResponse({
				wordnikLoaded : wordnikLoaded
			});
		else if (request.message == 'correctWord') {
			switch (getAlphabet( request.word )) {
				case keyboardLayout.LATIN :
					var transliterate = latinToCyrilic
				( request.word );
					var transliterateIndex = rechko.indexOf( transliterate );
				 	if (transliterateIndex != -1)
					    swagger.word.getDefinitions(
					    	{
					    		word:request.word,
					    		limit:1,
					    		sourceDictionaries:'all'
					    	},
					    	{
					    		responseContentType: 'application/json'
					    	},
			    			function (response) {
				  				if (response.obj.length === 0)
						      		sendResponse(
						      		{
							        	result: 'match',
							        	word: transliterate,
							        	original: request.word
					    			});
							}
					    );    
					break;	
				case keyboardLayout.CYRILIC :
				 	if (rechko.indexOf( request.word ) == -1) {
				 		transliterate = cyrilictToLatin( request.word );
					    swagger.word.getDefinitions(
					    	{
					    		word:transliterate,
					    		limit:1,
					    		sourceDictionaries:'all'
					    	},
					    	{
					    		responseContentType: 'application/json'
					    	},
					    	function(response) {
				  				if (response.obj.length > 0)
						      		sendResponse({
							        	result: 'match',
							        	word: transliterate,
							        	original: request.word
					    			});
							}
						);
					}
					break;
				}
			return true;
		}
	}        
);