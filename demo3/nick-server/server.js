const PORT = 3000;
const RATE_LIMIT = 400; // ms
var numClients = 0;

function rateLimit (socket) {
  var lastMessage = socket.lastMessage || 0;
  var now = socket.lastMessage = Date.now();
  return now < lastMessage + RATE_LIMIT;
};

function validate (msg) {
  var ret = "";
  try {
    var message = JSON.parse(msg);
    if (!("type" in message)) {
      ret = "You need to send a type in your message";
    } else if (!("content" in message)) {
      ret = "You need to send a content in your message";
    } else if (!("from" in message)) {
      ret = "You need to send a from in your message";
    }
  } catch (e) {
    ret = "You sent invalid JSON";
  }
  return ret;
};

function serverError (content) {
  return JSON.stringify({
    type: "error",
    from: "server",
    content: content,
  });
};

new (require("ws").Server)({ port: PORT }).on("connection", function (socket) {
  socket.on("message", function (msg) {
    if(rateLimit(socket)) {
      socket.send(serverError(
        "Rate limit: You may only send 1 message per " + RATE_LIMIT + "ms"
      ));
      try {
        socket.close();
      } catch (e) {
        console.error("tried to close a socket that the client already closed");
      }
      console.log("A client was rate limited");
      return;
    }

    var validationFail = validate(msg);
    if (validationFail) {
      socket.send(serverError(validationFail));
      console.log(msg + " -> " + validationFail);
      return;
    } else {
      console.log(msg);
    }

    this.clients.forEach(function (client) {
      if (client !== socket) {
        try {
          client.send(msg);
        } catch (e)  {
          console.error("did not send to disconnected client");
        }
      }
    });
  }.bind(this));

  socket.on("close", function () { console.log(--numClients + " clients"); });
  console.log(++numClients + " clients");
});

console.log("Listening on port " + PORT);

