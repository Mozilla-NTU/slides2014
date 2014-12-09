document.addEventListener('DOMContentLoaded', function () {
  var messageInput = document.querySelector('#message_input');
  var messageBox = document.getElementById('message_box');
  var button = document.getElementsByTagName('button')[0];

  function addToMessageBox (msg) {
    var p = document.createElement('p');
    p.textContent = msg;
    messageBox.appendChild(p);
    messageInput.value = '';
    messageInput.focus();
  };

  button.addEventListener('click', function () {
    addToMessageBox(messageInput.value);
  }, false);

  messageInput.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      addToMessageBox(messageInput.value);
    }
  });
});

