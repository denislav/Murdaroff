console.log('Mudar content script loading');
// 'use strict';
// alert("Vladko e tuk!");

/**
* The background page of the Chrome extension.
* @namespace ContentScript
*/

// var wordnikLoaded = 'no';

// document.addEventListener("keypress", function(e) {
// console.log(e.target.tagName,e.target.type,e.target.value,e.srcElement.tagName,e.srcElement.type,e.srcElement.value);
// var t =e.target;
// console.log(t,t.innerText);
// }, true);
// pri click varhu element da se zakacha, pri refresh 0 vizh flip extension-a kak se reloadva pri scroll v fb
//4h

// test case pisane posredata na texta 2h

// funkcionalnost da opravq i izmestvane na klavishite

//<textarea id="wmd-input" class="wmd-input processed" name="post-text" cols="92" rows="15" tabindex="101" data-min-length=""></textarea>
// undo_transliteration - Ctrl+Space 2h

// chrome.runtime.getBackgroundPage(function callback)
var wordnikLoaded = false;
chrome.runtime.sendMessage(
    {
        message: "isWordnikLoaded"
    },
    function (response) {
        wordnikLoaded = response.wordnikLoaded;
    }
);
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('request.message ', request.message);
        if (request.message == "wordnikLoaded"){
            var newMeta = document.createElement('meta');
            newMeta.setAttribute('name','wordnikLoaded');
            document.head.appendChild(newMeta);
            wordnikLoaded = true;
        }
    }
);

/**
* Updates the element value to the transliterated word.
* @function
*/
function vladko(response,element) {
    console.log('response.result: ', response.result);
    console.log('response.word: ', response.word);
    console.log('response.original: ' , response.original);
    console.log('this: ',this);
    element.value =   element.value.replace(response.original, response.word);
    console.log("element.value: ",element.value);
    element.original = response.original;
}

/**
* Executed on the event of user input is space bar (" ") in order to check the input for requred transliteration.
* @function
*/
function onSpace(event, element) {
    if (event.keyCode == ' '.charCodeAt(0)) {
        if (event.ctrlKey == true){
            element.value = element.original;
        } else {
            var words = event.currentTarget.value.split(" ");
            var last = words.length;
            var word2 = words[last - 1];
            console.log('this: ',  this);
            console.log('input: ', input);
            console.log('word2: ', word2);
            if (wordnikLoaded == true){
                chrome.runtime.sendMessage(
                    {
                        word: word2
                    },
                    function (response) { vladko(response,element) }
                );
                console.log('after sendMessage');
            }
        }
    }
}


/**
* Factory method which creates the callback function to be executed upon user text input.
* @function
*/
function vladkoFacto(element) {
    return function (event) {
        onSpace(event,element)
    }
}

function vladkoOnSpace(event) {
    onSpace(event,input)
}
/**
* Collection of input element for which the text input will be transliterated.
* @type {NodeList}
*/
 var inputElements = document.getElementsByTagName("input"); // handle <textArea> too

 var inputNumber = inputElements.length;

 for (var i = 0; i < inputNumber; i++) {
     var input = inputElements[i];
     var type = input.type;
     console.log(type);
     console.log(type == "text");
     if (type == "text") {
         input.onkeypress = vladkoFacto(input);
     }
 }

document.addEventListener('click', function(event) {
    var input = event.srcElement;
    if(input.type === "text") {

        console.log("hooked on", input)
        input.onkeypress = vladkoFacto(input);
    }
});
console.log('Mudar content script loaded successfully');
 // alert("done");