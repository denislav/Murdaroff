// 'use strict';

/**
 * The content scripte of the Chrome extension.
 * @namespace ContentScript
 */

/**
 * Flag indicating if connection to Wordnik is set up and ready to transmitting requests.
 * @memberof ContentScript
 * @member 
 * @type {boolean}
 
 */
var isWordnikLoaded = false;

/**
 * Updates the state of the connection with Wordnik. If connection is established
 * a <meta> tag isWordnikLoaded is appended to the page header so this can be used by
 * automated testing scripts as notification to proceed with the test.
 * Also the local flag with the state is maintaned in content script.
 * @memberof ContentScript
 * @function
 */
function updateState(state) {
    isWordnikLoaded = state;
    if (isWordnikLoaded === true) {
        var newMeta = document.createElement('meta');
        newMeta.setAttribute('name', 'wordnikLoaded');
        document.head.appendChild(newMeta);
    }
}

chrome.runtime.sendMessage({
        message: 'isWordnikLoaded'
    },
    function(response) {
        updateState(response.isWordnikLoaded);
    }
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        updateState(request.isWordnikLoaded);
    }
);


/**
 * Flag indicating weather undo of last transliterated word is allowed.
 * Undo is allowed only after transliteration has occured.
 * @memberof ContentScript
 * @member 
 * @type {boolean}
 */
var isUndoAllowed = false;

/**
 * Updates the element value to the transliterated word.
 * @memberof ContentScript
 * @function
 */
function vladko(response, element) {
    if (response.result === 'match') {
        element.original = element.value;
        element.value = element.value.slice(0, response.cursor - response.word.length) + response.word + element.value.slice(response.cursor, element.value.length);
        element.selectionStart = response.cursor + 1;
        element.selectionEnd = response.cursor + 1;
        isUndoAllowed = true;
    }
}


function getPreviousWord(element, cursor) {
    var wordsBefore = element.value.substr(0, element.selectionStart).split(' ');
    var lastWord = wordsBefore[wordsBefore.length - 2];
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
    if (event.keyCode === ' '.charCodeAt(0)) {
        if (event.ctrlKey === true && event.shiftKey === true) {
            if (isUndoAllowed === true) {
                var keepCursor = element.selectionStart;
                element.value = element.original;
                element.selectionStart = keepCursor;
                element.selectionEnd = keepCursor;
                isUndoAllowed = false;
            }
        } else {
            var wordsBefore = element.value.substr(0, element.selectionStart).split(' ');
            var lastWord = wordsBefore[wordsBefore.length - 2];
            if (isWordnikLoaded === true) {
                chrome.runtime.sendMessage({
                        message: 'correctWord',
                        word: lastWord,
                        cursor: element.selectionStart-1
                    },
                    function(response) {
                        vladko(response, element);
                    }
                );
            }
        }
    } else
        isUndoAllowed = false;
}

/**
 * Factory method which creates the callback function to be executed upon user text input.
 * @memberof ContentScript
 * @function
 * @param {Object} element The element on which the callback is hooked.
 * @returns {function}
 */
function vladkoFacto(element) {
    return function(event) {
        onSpace(event, element);
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
        input.onkeyup = vladkoFacto(input);
    }
}

document.addEventListener('click', function(event) {
    var input = event.srcElement;
    if (input.type === 'text' ||
        input.type === 'textarea' ||
        input.tagName === 'input' ||
        input.tagName === 'textarea') {
        input.onkeyup = vladkoFacto(input);
    //keypress
    }
});