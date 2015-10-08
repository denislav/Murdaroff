// 'use strict';

var client = require('swagger-client');
var rechko = require('../res/bg_dictionary');
// var rechko = require('./rechko');

/**
* The background page of the Chrome extension.
* @namespace Background
*/

/**
* Supported keyboard layouts
* @enum
*/
var keyboardLayout = {
    LATIN:0,
    CYRILIC:1
};

var wordnikLoaded = false;
var swagger = new client({
	url: 'http://api.wordnik.com:80/v4/word.json',
	success: function() {
    	swagger.word.getWord({word:'carses'},{responseContentType: 'application/json'},function(response){
    		console.log(response.obj.hasOwnProperty("canonicalForm")? response.obj.word + ' exists': response.obj.word + ' does not exist');
      		console.log('=== response ===');
      		wordnikLoaded =true;
			chrome.tabs.query({}, function(tabs){
				for (var i = 0; i < tabs.length; i++) {				 
				 chrome.tabs.sendMessage(
			    	tabs[i].id,
			    	{ message:'wordnikLoaded'},
			    	function(response) { console.log('wordnik loaded aknowledged'); }
			    );  
				};
			    
			});
    });
  }
});
swagger.clientAuthorizations.add("apiKey", new client.ApiKeyAuthorization("api_key","eddc3027033322a3a96080687ee0d8fab8ba52dca55e97dae","query"));


/**
*	
*/
// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         console.log('request.message ', request.message);
//         var newMeta = document.createElement('meta');
//         newMeta.setAttribute('name','wordnikLoaded');
//         document.head.appendChild(newMeta);
//     }
// );

/**
* Decides which is the keyboard layout of the input text.
* @function
* @returns {enum}
*/
function getAlphabet(word) {
    if (word.charCodeAt(0) < 1000) {
    	console.log('Latin keyboard input');
        return "latin";
    }
    else {
    	console.log('Cyrilic keyboard input');    	
        return "cyrilic";
    }
};

/**
* Represents Latin keyboard layout as a string array.
* @const
*/
var latin_keyboard = "`qwertyuiop[]\\asdfghjkl;'zxcvbnm,./" + 'QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?';
/**
* Represents Cyrilic keyboard layout as a string array.
* @const
*/
var cyrilic_keyboard = "ючшертъуиопящьасдфгхйкл;'зжцвбнм,./" + 'ЮЧШЕРТЪУИОПЯЩѝАСДФГХЙКЛ:"ЗЖЦВБНМ„“?';

/**
* Converts word from latin keyboard layout to cyrilic keyboard layout.
* @function
* @returns Word converted to Cyrilic keyboard layout
*/
function latin_to_cyrilic(word){
    return word.split('').map(function (char){
        var index = latin_keyboard.indexOf(char);
        return cyrilic_keyboard.charAt(index);
    } ).join('')
};
function cyrilic_to_latin(word){
    return word.split('').map(function (char){
        var index = cyrilic_keyboard.indexOf(char);
        return latin_keyboard.charAt(index);
    } ).join('')
};

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.message == "isWordnikLoaded"){
			sendResponse({
				        	wordnikLoaded : wordnikLoaded
			    			});
		}
		else {			
		    console.log(sender.tab ?
		                "from a content script:" + sender.tab.url :
		                "from the extension");
			var alphabet = getAlphabet(request.word);

			if 	(alphabet == "latin") {
				var transliterate = latin_to_cyrilic(request.word);
				console.log('transliterate: '+ transliterate);
				var transliterateIndex = rechko.indexOf( transliterate );
				console.log('transliterateIndex: '+ transliterateIndex);
			 	if (transliterateIndex != -1)
				    swagger.word.getWord(
				    	{word: request.word},
				    	{responseContentType: 'application/json'},
		    			function (response){
			  				console.log('transliterateAgain: ', transliterate);
			  				console.log('request.word: ' ,request.word);
			  				console.log('!canonicalForm: ',!response.obj.hasOwnProperty("canonicalForm"));
			  				if (!response.obj.hasOwnProperty("canonicalForm")) {
			  					responseVladko = {
						        	result: "match",
						        	word: transliterate,
						        	original: request.word
				    			};
			  					console.log('responseVladko: ', responseVladko);
					      		sendResponse(responseVladko);
					      		console.log('after send response ');
					      	}
						}
				    );    
			}
			else if (alphabet == "cyrilic") {
			    var bg_index = rechko.indexOf(request.word);
			    console.log('bg_word: '+ bg_index);
			 	if (bg_index == -1) {
			 		transliterate = cyrilic_to_latin(request.word) ;
				    swagger.word.getWord({word: transliterate},{responseContentType: 'application/json'},function(response){
		  				if (response.obj.hasOwnProperty("canonicalForm")){
				      		sendResponse({
					        	result: "match",
					        	word: transliterate,
					        	original: request.word
			    			});
				      	}
					});
				}
			}
			return true;
		}
	}        
);


// /**
// *	To handle undo of transliteration
// *	@todo
// */
// chrome.commands.onCommand.addListener(function(command) {
//         console.log('Command:', command);
//       });

// console.log('before reader');
// var reader = new FileReader();
// // reader.onerror = errorHandler;
// reader.onloadend = function(e) {
// 	console.log(e.target.result);
// };
// reader.readAsText('rechko.js');


console.log('Mudar background.js loaded successfully');
 // alert(rechko[13]);

