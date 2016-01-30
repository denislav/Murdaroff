// 'use strict';

var client = require('swagger-client');
var rechko = require('../res/bgDictionary');

/**
* background.js of the Chrome extension.
* @namespace Background
*/

/**
* Open options page after installation of the extension
* @memberof Background
*/
function installNotice() {
    if (localStorage.getItem('install_time'))
        return;

    localStorage.setItem('install_time', new Date().getTime());
    chrome.tabs.create({url: "options.html"});
}
installNotice();

/**
* Supported keyboard layouts
* @memberof Background
* @enum
*/
var keyboardLayout = {
    LATIN: 0,
    CYRILIC: 1
};
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
* Flag indicating if connection to Wordnik is set up and ready to transmitting requests.
* @memberof Background
* @member 
* @type {boolean}
*/
var isWordnikLoaded = false;
var swagger = new client({
	url: 'http://api.wordnik.com:80/v4/word.json',
	success: function() {
				swagger.word.getDefinitions({word:'carses', limit:1, sourceDictionaries:'all'},{responseContentType: 'application/json'}, wordnikLoaded );
			}
});
function wordnikLoaded(response){
	console.log(response.obj[0]===undefined? "carses doesn't exist" : response.obj[0].word + ' exists ' ); 
		console.log('=== response ===');
		isWordnikLoaded = true;
	chrome.tabs.query({}, function(tabs){
		for (var i = 0; i < tabs.length; i++) {				 
		 	chrome.tabs.sendMessage(
		    	tabs[i].id,
		    	{	
		    		isWordnikLoaded : isWordnikLoaded
		    	},
				logWordnikLoad		    	
	    	);  
		}			    
	});
}
function logWordnikLoad(response) {
	console.log('wordnik loaded aknowledged');
}
swagger.clientAuthorizations.add('apiKey', new client.ApiKeyAuthorization('api_key','eddc3027033322a3a96080687ee0d8fab8ba52dca55e97dae','query'));


/**
* Contains the keyboard layouts represented as a string of characters in the order of qwerty keyboard. One character maps to the others with the same position in the other strings.
* @memberof Background
* @const
*/
var keyboard = {
	LATIN_KEYBOARD : "`qwertyuiop[]\\asdfghjkl;'zxcvbnm,./" + 'QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
	CYRILIC_KEYBOARD_PHONETIC_NEW : "ючшертъуиопящьасдфгхйкл;'зжцвбнм,./" + 'ЮЧШЕРТЪУИОПЯЩѝАСДФГХЙКЛ:"ЗЖЦВБНМ„“?',
	CYRILIC_KEYBOARD_BDS : ",уеишщксдзц;„ьяаожгтнвмчюйъэфхпрлб" + 'ыУЕИШЩКСДЗЦ§“ѝЯАОЖГТНВМЧЮЙЪЭФХПРЛБ',
	CYRILIC_KEYBOARD_PHONETIC_TRADITIONAL : "явертъуиопшщюасдфгхйкл;'зьцжбн,./" + 'ЯВЕРТЪУИОПШЩЮАСДФГХЙКЛ:"ЗѝЦЖБНМ<>?',
};
keyboard.selectedCyrilicKeyboard = keyboard.CYRILIC_KEYBOARD_PHONETIC_NEW;

function setLayout(){
	return function(storage){
		if (setLayout.cyrilicLayoutUsed)
			keyboard.selectedCyrilicKeyboard = keyboard[storage.cyrilicLayoutUsed];
	}
}
chrome.storage.sync.get({
    		'cyrilicLayoutUsed': 'CYRILIC_KEYBOARD_PHONETIC_NEW'
  		}, setLayout() 
  	);

/**
* Converts a word from one keyboard layout to anothe keyboard layout.
* @memberof Background
* @function
* @param {string} word - Input word
* @param {string} fromKeyboard - Keyboard layout in which the word is written
* @param {string} toKeyboard - Keyboard layout in which to transliterate the word
* @returns {string} Transliterated word
*/
keyboard.transliterate = function (word, fromKeyboard, toKeyboard){
		return word.split('')
			.map( function (char) {
				var index = fromKeyboard.indexOf(char);
				return toKeyboard.charAt(index);
    		} )
    		.join('');
	}	

/**
*
*/
// function transliterate(fromKeyboard, toKeyboard, request, sendResponse){
function transliterate(request, sendResponse){
	// function continueTransliteration(storage){
	function getTransliterationDirection(request){
		switch( getAlphabet( request.word )){
				case keyboardLayout.LATIN :
					return {fromKeyboard: keyboard.LATIN_KEYBOARD, toKeyboard: keyboard.selectedCyrilicKeyboard }
					break;	
				case keyboardLayout.CYRILIC :
					return {fromKeyboard:  keyboard.selectedCyrilicKeyboard , toKeyboard: keyboard.LATIN_KEYBOARD }
					break;
		}
	}
	var direction = getTransliterationDirection(request);
    var transliterate = keyboard.transliterate(request.word, direction.fromKeyboard, direction.toKeyboard);

	function findInDictionary(dictionary, word, callback){
		switch (dictionary) {
			case keyboard.LATIN_KEYBOARD:
				swagger.word.getDefinitions(
			    	{
			    		word: word,
			    		limit: 1,
			    		sourceDictionaries:'all'
			    	},
			    	{
			    		responseContentType: 'application/json'
			    	},
	    			function (response) {
	    				callback( response.obj.length > 0 )
					}
		    	);    
				break;
			default :
				callback( rechko.indexOf( transliterate ) != -1 )
		}
	}	
	function decideResponse(inputCorrect, transliterationCorrect){
		var match = ( (!inputCorrect) & transliterationCorrect) ? 'match' : 'no match';			
		sendResponse({
			        	result: match,
			        	word: transliterate,
			        	original: request.word,
			        	cursor: request.cursor
		});	
	}
	findInDictionary(direction.fromKeyboard, request.word, function(inputCorrect){
		findInDictionary(direction.toKeyboard, transliterate, function(transliterationCorrect){
			decideResponse(inputCorrect,transliterationCorrect);
		} );
	});
}

function  processInput(request, sender, sendResponse) {
	switch(request.message) {
		case 'isWordnikLoaded':
			sendResponse({
				isWordnikLoaded : isWordnikLoaded
			});
			break;
		case 'correctWord':
			transliterate( request, sendResponse );
			break;
	}
	return true;
}   
chrome.runtime.onMessage.addListener( 	processInput );