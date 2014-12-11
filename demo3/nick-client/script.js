document.addEventListener('DOMContentLoaded', function () {
  var messageInput = document.querySelector('#message_input');
  var messageBox = document.getElementById('message_box');
  var button = document.getElementsByTagName('button')[0];
  var imageButton = document.getElementsByTagName('button')[1];
  var linkButton = document.getElementsByTagName('button')[2];
  var socket = new WebSocket('ws://10.25.213.241:3000');
  var myname = document.getElementById('myname').textContent;

  function addToMessageBox (msg) {
    var p = document.createElement('p');
    p.textContent = msg;
    messageBox.appendChild(p);
  };

  function addImage (url) {
    var img = new Image();
    img.src = url;
    messageBox.appendChild(img);
  };

  function addLink (url) {
    var a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    messageBox.appendChild(a);
  };

  function broadcast (msg, type) {
    socket.send(JSON.stringify({
      from: myname,
      type: type,
      content: msg,
    }));
  };

  function clear () {
    messageInput.value = '';
    messageInput.focus();
  };

  button.addEventListener('click', function () {
    addToMessageBox(messageInput.value);
    broadcast(messageInput.value, 'text');
    clear();
  }, false);

  imageButton.addEventListener('click', function () {
    addImage(messageInput.value);
    broadcast(messageInput.value, 'image');
    clear();
  }, false);

  linkButton.addEventListener('click', function () {
    addLink(messageInput.value);
    broadcast(messageInput.value, 'link');
    clear();
  });

  messageInput.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      addToMessageBox(messageInput.value);
    }
  });

  socket.onopen = function () {
    console.log('connected', socket);
    socket.onmessage = function (e) {
      console.log(e.data);
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'text') {
          addToMessageBox(msg.from + ': ' + msg.content);
        } else if (msg.type === 'image') {
          addToMessageBox(msg.from + ': ');
          addImage(msg.content);
        } else if (msg.type === 'link') {
          addToMessageBox(msg.from + ': ');
          addLink(msg.content);
        }
      } catch (e) {
        console.error('malformed json');
      }
    };
  };
});

