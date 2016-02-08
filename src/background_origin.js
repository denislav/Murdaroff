/**
 * background.js of the Chrome extension.
 * @namespace Background
 */

var rechko = require('../res/bg_dictionary');
var build = require('../src/build');
var client = build.isMockupTest() ?
	require('../test/swagger_mockup') : require('swagger-client')

/**
 * Opens options page after installation of the extension
 * @memberof Background
 */
function installNotice() {
	if (localStorage.getItem('install_time'))
		return;

	localStorage.setItem('install_time', new Date().getTime());
	chrome.tabs.create({
		url: 'options.html'
	});
}
if (build.isProduction())
	installNotice();

/**
 * Notifies content stcipt in all tabs that Wordnik initialization finished and transliteration requests can begin. 
 * @memberof Background
 * @function
 * @param {Object} Response from Wordnik
 */
function wordnikLoaded(response) {
	if (!build.isProduction())
		console.log(response.obj[0] === undefined ? "carses doesn't exist" : response.obj[0].word + ' exists ');
	isWordnikLoaded = true;
	chrome.tabs.query({}, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
			chrome.tabs.sendMessage(
				tabs[i].id, {
					isWordnikLoaded: isWordnikLoaded
				}
			);
		}
	});
}

/**
 * Flag indicating if connection to Wordnik is set up and ready for transmitting requests.
 * @memberof Background
 * @member 
 * @type {boolean}
 */
var isWordnikLoaded = false;
/**
 * The Swagger object used to access the Wordnik web service
 * @memberof Background
 * @member 
 * @type {SwaggerClient}
 */
var wordnik = new client({
	url: 'http://api.wordnik.com:80/v4/word.json',
	success: function() {
		wordnik.word.getDefinitions({
			word: 'carses',
			limit: 1,
			sourceDictionaries: 'all'
		}, {
			responseContentType: 'application/json'
		}, wordnikLoaded);
	}
});
wordnik.clientAuthorizations.add('apiKey', new client.ApiKeyAuthorization('api_key', 'eddc3027033322a3a96080687ee0d8fab8ba52dca55e97dae', 'query'));

/**
 * Alphabets to use in transliteration.
 * @memberof Background
 * @enum
 */
var alphabet = {
	ENGLISH: 0,
	CYRILIC: 1,
	UNKNOWN: -1
};
/**
 * Decides what is the alphabet of the input.
 * @memberof Background
 * @function
 * @param {string} Input word to get alphabet from.
 * @returns {alphabet}	Enumeration value of the alphabet used to write this word.
 */
function getAlphabet(word) {
	var isEnglish = word.split('').every(function(letter) {
		return letter.charCodeAt(0) >= 65 && letter.charCodeAt(0) <= 122
	});
	if (isEnglish)
		return alphabet.ENGLISH;

	var isBulgarian = word.split('').every(function(letter) {
		return letter.charCodeAt(0) >= 1040 && letter.charCodeAt(0) <= 1103
	});
	if (isBulgarian)
		return alphabet.CYRILIC;

	return alphabet.UNKNOWN;
}
/**
 * Contains the keyboard layouts represented as a string of characters in the order of qwerty keyboard. One character maps to the others with the same position in the other strings.
 * @memberof Background
 */
var keyboard = {
	ENGLISH: "`qwertyuiop[]\\asdfghjkl;'zxcvbnm,./" + 'QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
	BULGARIAN_PHONETIC_NEW: "ючшертъуиопящьасдфгхйкл;'зжцвбнм,./" + 'ЮЧШЕРТЪУИОПЯЩѝАСДФГХЙКЛ:"ЗЖЦВБНМ„“?',
	BULGARIAN_STANDARD: ",уеишщксдзц;„ьяаожгтнвмчюйъэфхпрлб" + 'ыУЕИШЩКСДЗЦ§“ѝЯАОЖГТНВМЧЮЙЪЭФХПРЛБ',
	BULGARIAN_PHONETIC_TRADITIONAL: "явертъуиопшщюасдфгхйкл;'зьцжбн,./" + 'ЯВЕРТЪУИОПШЩЮАСДФГХЙКЛ:"ЗѝЦЖБНМ<>?',
};
/**
 * Contains the keyboard layout which to use for cyrilic in transliteration.
 * @memberof Background
 */
keyboard.selectedCyrilicKeyboard = keyboard.BULGARIAN_PHONETIC_NEW;

// function setLayout() {
// 	return function(storage) {
// 		if (setLayout.cyrilicLayoutUsed)
// 			keyboard.selectedCyrilicKeyboard = keyboard[storage.cyrilicLayoutUsed];
// 	};
// }
chrome.storage.sync.get({
	'cyrilicLayoutUsed': 'BULGARIAN_PHONETIC_NEW'
}, storage => keyboard.selectedCyrilicKeyboard = keyboard[storage.cyrilicLayoutUsed]);

/**
 * Converts a word from one keyboard layout to another keyboard layout.
 * @memberof Background
 * @function
 * @param {string} word - Input word
 * @param {string} fromKeyboard - Keyboard layout in which the word is written
 * @param {string} toKeyboard - Keyboard layout in which to transliterate the word
 * @returns {string} Transliterated word
 */
keyboard.transliterate = function(word, fromKeyboard, toKeyboard) {
	return word.split('')
		.map(function(char) {
			var index = fromKeyboard.indexOf(char);
			return toKeyboard.charAt(index);
		})
		.join('');
};



/**
 * Implements the logic for transliteration OF incoming input.
 * @memberof Background
 * @param {object} request - Request coming from the content script contaning input word and other information.
 * @param {function} sendResponse - The callback to call in order to respond to the content script request.
 */
function tryCorrect(request, sendResponse) {
	var direction = (request.alphabet == alphabet.ENGLISH) ? {
		fromKeyboard: keyboard.ENGLISH,
		toKeyboard: keyboard.selectedCyrilicKeyboard
	} : {
		fromKeyboard: keyboard.selectedCyrilicKeyboard,
		toKeyboard: keyboard.ENGLISH
	};

	var transliteration = keyboard.transliterate(request.word, direction.fromKeyboard, direction.toKeyboard);
	/**
	 * Searches for a word in a provided dictionary.
	 * @memberof Background
	 * @param {string} word - Word to search for.
	 * @param {alphabet} dictionary - Dictionary to search in.
	 * @param {function} callback - Gets called with argument true if word is found in dictionary.
	 */
	function findInDictionary(word, dictionary, callback) {
		switch (dictionary) {
			case keyboard.ENGLISH:
				wordnik.word.getDefinitions({
						word: word,
						limit: 1,
						sourceDictionaries: 'all'
					}, {
						responseContentType: 'application/json'
					},
					function(response) {
						callback(response.obj.length > 0);
					}
				);
				break;
			default:
				callback(rechko.indexOf(word) != -1);
		}
	}

	/**
	 * Implements the logic for transliteration OF incoming input.
	 * @memberof Background
	 * @param {object} request - Request coming from the content script contaning input word and other information.
	 * @param {function} sendResponse - The callback to call in order to respond to the content script request.
	 */
	function decideResponse(inputCorrect, transliterationCorrect) {
		var match = ((!inputCorrect) && transliterationCorrect) ? 'match' : 'no match';
		sendResponse({
			result: match,
			word: transliteration,
			original: request.word,
			cursor: request.cursor
		});
	}
	findInDictionary(request.word, direction.fromKeyboard, function(inputCorrect) {
		findInDictionary(transliteration, direction.toKeyboard, function(transliterationCorrect) {
			decideResponse(inputCorrect, transliterationCorrect);
		});
	});
}

function processMessage(request, sender, sendResponse) {
	switch (request.message) {
		case 'isWordnikLoaded':
			sendResponse({
				isWordnikLoaded: isWordnikLoaded
			});
			break;
		case 'correctWord':
			request.alphabet = getAlphabet(request.word);
			if (request.alphabet !== alphabet.UNKNOWN)
				tryCorrect(request, sendResponse);
			break;
	}
	return true;
}
chrome.runtime.onMessage.addListener(processMessage);