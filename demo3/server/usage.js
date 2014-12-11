//1. cd into this directory from your Terminal
//2. npm install
//3. npm start

var socket = new WebSocket("ws://localhost:3000");

socket.onmessage = function (message) {
  console.log("a: " + message.data);
};

socket.send(JSON.stringify({
  from: "Nick",
  type: "text",
  content: "Hello world!",
}));

