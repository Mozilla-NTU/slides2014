document.addEventListener('DOMContentLoaded', function () {
  var messageInput = document.querySelector('#message_input');
  var messageBox = document.getElementById('message_box');
  var button = document.getElementsByTagName('button')[0];

  function addToMessageBox (msg) {
    var p = document.createElement('p');
    p.textContent = msg;
    messageBox.appendChild(p);
  };

  button.addEventListener('click', function () {
    addToMessageBox(messageInput.value);
    messageInput.value = '';
    messageInput.focus();
  }, false);
});

