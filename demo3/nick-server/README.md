##Usage
Example usage from client side JavaScript:

```javascript
var socket = new WebSocket("ws://localhost:3000");

socket.onmessage = function (message) {
  console.log("a: " + message.data);
};

socket.send(JSON.stringify({
  from: "Nick",
  type: "text",
  content: "Hello world!",
}));
```

##Running the Server
Install dependencies `npm install` then start the server `npm start`.
