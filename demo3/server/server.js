var _ = require('underscore');

const PORT = 3001;
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

      //here is where we receive the messages from clients
      handleReceivedMessage(JSON.parse(msg), socket);
      socket.on('close', function(){
        
      });
    }

    this.clients.forEach(function (client) {
      if (client !== socket) {
        try {
          //client.send(msg);
        } catch (e)  {
          console.error("did not send to disconnected client");
        }
      }
    });
  }.bind(this));

  socket.on("close", function () {
    console.log(--numClients + " clients");
    for(var clientName in clients){
      if(clients[clientName] == socket){
        delete clients[clientName];
      }
    }
  });
  console.log(++numClients + " clients");
});

console.log("Listening on port " + PORT);



/**
protocol:
{
  from:<SENDER_NAME>, 
  [to:<RECEIVER_NAME>,]
  type:<text|login|userlist|msg|...>, 
  content:<CONTENT>
}

examples:
get an echo:        {from:'xxx', type:'text', content:'hello server'}
login:              {from:'xxx', type:'login', content:''}
get the user list:  {from:'xxx', type:'userlist', content:''}
send message:       {from:'xxx', to:'xxx', type:'msg', content:'hello'}
*/
function handleReceivedMessage(msgObj, socket){
  console.log('[Receive]', msgObj);

  //check the type
  var result;
  switch(msgObj.type){
    case 'text':
      result = {type:'echo', from:'server', content:msgObj};
      forwardMsg(msgObj, socket);
      break;

    case 'msg':
      result = forwardMsg(msgObj, socket);
      break;

    case 'login':
      result = loginUser(msgObj, socket);
      break;

    case 'userlist':
      result = getUserList();
      break;

    default:
      result = {type:'error', from:'server', content:'unsupported message type'};
  }

  if(result){
    console.log('[Send]', result);
    socket.send(JSON.stringify(result));
  }
}



var clients = {};
function loginUser(msgObj, socket){
  var name = msgObj.from;
  if(!clients[name]){
    clients[name] = socket;
    return {type:'login', from:'server', content:'login success'};
  }
  else {
    return {type:'error', from:'server', content:'name not available'};
  }
}


function forwardMsg(msgObj, socket){
  if(msgObj.to && clients[msgObj.to]) {
    if(clients[msgObj.from] && clients[msgObj.from] == socket) {
      var receiver = clients[msgObj.to];
      receiver.send(JSON.stringify(msgObj));
      return null;
    }
    else {
      //invalid sender
      return {type:'error', from:'server', content:'invalid sender, did you logged in with your name?'};
    }
  }
  else {
    //invalid receiver
    return {type:'error', from:'server', content:'invalid receiver, receiver name does not existed'};
  }
}


function getUserList(){
  var names = _.map(clients, function(socket, name){
    return name;
  });
  return {type:'userlist', from:'server', content:names};
}
