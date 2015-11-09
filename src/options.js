// Saves options to chrome.storage.sync.
function save_options() {
  var cyrilicLayoutUsed = document.getElementById('cyrilic_layout').value;
  console.log(cyrilicLayoutUsed);
  chrome.storage.sync.set({
    'cyrilicLayoutUsed': cyrilicLayoutUsed
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    console.log(status);
    status.textContent = 'Запомних';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  console.log('restore');
  chrome.storage.sync.get({
    'cyrilicLayoutUsed': 'CYRILIC_KEYBOARD_PHONETIC_NEW'
  }, function(items) {
     console.log(items);
    document.getElementById('cyrilic_layout').value = items.cyrilicLayoutUsed;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
console.log('options loaded');