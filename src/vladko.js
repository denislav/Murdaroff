// 'use strict';

/**
* The background page of the Chrome extension.
* @namespace ContentScript
*/

/**
* TO DO

* to hook on any keypress on document insted of selected elements.
// document.addEventListener('keypress', function(e) {
// console.log(e.target.tagName,e.target.type,e.target.value,e.srcElement.tagName,e.srcElement.type,e.srcElement.value);
// var t =e.target;
// console.log(t,t.innerText);
// }, true);

* new use case - transliterate when cursor is moved back user is writing in the middle of the text
*/

/**
* Flag indicating if connection to Wordnik is set up and ready to transmitting requests.
* @memberof ContentScript
* @member 
* @type {boolean}

*/
var wordnikLoaded = false;

/**
* Updates the state of the connection with Wordnik. If connection is established
* a <meta> tag wordnikLoaded is appended to the page header so this can be used by
* automated testing scripts as notification to proceed with the test.
* Also the local flag with the state is maintaned in content script.
* @memberof ContentScript
* @function
*/
function updateState(state){
    wordnikLoaded = state;
    if ( wordnikLoaded === true ){
        var newMeta = document.createElement('meta');
        newMeta.setAttribute('name','wordnikLoaded');
        document.head.appendChild(newMeta);
    }
}

chrome.runtime.sendMessage(
    {
        message: 'isWordnikLoaded'
    },
    function (response) {
        updateState(response.wordnikLoaded);
    }
);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        updateState(request.wordnikLoaded);
    }
);


/**
* Flag indicating weather undo of last transliterated word is allowed.
* Undo is allowed only after transliteration has occured.
* @memberof ContentScript
* @member 
* @type {boolean}
*/
var undoAllowed = false;

/**
* Updates the element value to the transliterated word.
* @memberof ContentScript
* @function
*/
function vladko(response,element) {
    element.value = element.value.replace(response.original, response.word);
    element.original = response.original;
    undoAllowed = true ;
}

/**
* Executed on the event of user input is space bar (" ") 
* in order to check the input for requred transliteration.
* @memberof ContentScript
* @function
* @param {Object} event The event triggered on the element
* @param {Object} element The element on which the callback is hooked.
*/
function onSpace(event, element) {
    if (event.keyCode == ' '.charCodeAt(0)) {
        if (event.ctrlKey === true) {
            if (undoAllowed === true)
                element.value = element.original;
        } else {
            var words = event.currentTarget.value.split(' ');
            var last = words.length;
            var word2 = words[last - 1];
            if (wordnikLoaded === true){
                chrome.runtime.sendMessage(
                    {
                        message: 'correctWord',
                        word: word2
                    },
                    function (response) {
                        vladko(response,element);
                    }
                );
            }
        }
    } else
        undoAllowed = false;
 }

/**
* Factory method which creates the callback function to be executed upon user text input.
* @memberof ContentScript
* @function
* @param {Object} element The element on which the callback is hooked.
* @returns {function}
*/
function vladkoFacto(element) {
    return function (event) {
        onSpace(event,element);
    };
}

/**
* Collection of input element for which the text input will be transliterated.
* @memberof ContentScript
* @type {NodeList}
*/
 var inputElements = document.getElementsByTagName('input'); // handle <textArea> too

 var inputNumber = inputElements.length;

 for (var i = 0; i < inputNumber; i++) {
     var input = inputElements[i];
     var type = input.type;
     if (type == 'text') {
         input.onkeypress = vladkoFacto(input);
     }
 }

document.addEventListener('click', function(event) {
    var input = event.srcElement;
    if(input.type === 'text' || input.type === 'textarea' || input.tagName === 'input' || input.tagName === 'textarea') {
        console.log('hooked on', input);
        input.onkeypress = vladkoFacto(input);
    }
});