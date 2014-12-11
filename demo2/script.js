window.addEventListener('DOMContentLoaded', function () {
    var messageInput = document.querySelector('#message_input');
    var messageBox = document.getElementById('message_box');
    var button = document.getElementsByTagName('button')[1];
    var messages = getMessages();

    // Insert existing messages in messageBox
    messages.forEach( function (msg) {
        var p = document.createElement('p');
        p.textContent = msg;
        messageBox.appendChild(p);
    });

    function getMessages () {
        if (localStorage.messages) {
            return JSON.parse(localStorage.messages);
        } else {
            return [];
        }
    }

    function addToMessageBox (msg) {
        var p = document.createElement('p');
        p.textContent = msg;
        messageBox.appendChild(p);
        messageInput.value = '';
        messageInput.focus();

        messages = getMessages();

        messages.push(msg);
        console.log("saving messages", messages);

        localStorage.setItem("messages", JSON.stringify(messages));
    };

    button.addEventListener('click', function () {
        sendMessageToServer();
        addToMessageBox(messageInput.value);
    }, false);

    messageInput.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
            addToMessageBox(messageInput.value);
        }
    });

    document.querySelector("#reset").addEventListener("click", function () {
        localStorage.clear();
        messageBox.innerHTML = "";
        messageInput.value = "";
        messageInput.focus();
    }, false);



    var client = new WebSocket('ws://10.27.165.11:3001');
    client.addEventListener('open', function(){
        console.log('connected');
        getUserList();
    });
    client.addEventListener('close', function(){
        console.warn('we are disconnected');
    });
    client.addEventListener('message', function(event){
        console.log('Receive from server:', event.data);

        var data = JSON.parse(event.data);
        switch(data.type){
            case 'userlist':
                showUserList(data.content);
                break;

            case 'msg':
                showReceivedMessage(data.from, data.content);
                break;
        }
    });


    function getName(){
        var nameInput = document.getElementById('name_input');
        return nameInput.value;
    }


    function register(){
        var name = getName();
        if(name) {
            var msg = {
                from: name,
                type: 'login',
                content: ''
            };
            client.send(JSON.stringify(msg));
        }
    }

    function getUserList(){
        var msg = {
            from: getName(),
            type: 'userlist',
            content: ''
        };
        client.send(JSON.stringify(msg));
    }

    function showUserList(list){
        var userlistBox = document.getElementById('userlist_box');
        for(var i=0; i<list.length; ++i){
            var userItem = document.createElement('div');
            userItem.textContent = list[i];
            userlistBox.appendChild(userItem);
        }
    }

    function showReceivedMessage(from, content){
        var receivedMsgBox = document.getElementById('received_messages_box');
        var htmlCode = '';

        if(content.match(/\.png$/)) {
            htmlCode = '<img class="msgImage" src="' + content + '">';
        }
        else if(content.indexOf('http://') == 0){
            htmlCode = '<a href="' + content + '" target="_blank">link</a>';
        }
        else {
            htmlCode = content;
        }
        var messageItem = document.createElement('div');
        messageItem.innerHTML = '<b>' + from + '</b> : ' + htmlCode;
        receivedMsgBox.appendChild(messageItem);
    }

    function sendMessageToServer(){
        var receiverInput = document.getElementById('receiver_input'),
            messageInput = document.getElementById('message_input'),
            receiverName = receiverInput.value,
            messageContent = messageInput.value;
        if(receiverName && messageContent){
            var msg ={
                from: getName(),
                type: 'msg',
                to: receiverName,
                content: messageContent
            };
            client.send(JSON.stringify(msg));
            showReceivedMessage(getName(), messageContent);
        }
        else {
            alert('Please fill in receiver name and message content!');
        }
    }

    var registerBtn = document.getElementById('register_button');
    registerBtn.addEventListener('click', register);
});
