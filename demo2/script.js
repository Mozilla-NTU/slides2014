window.addEventListener('DOMContentLoaded', function () {
    var messageInput = document.querySelector('#message_input');
    var messageBox = document.getElementById('message_box');
    var button = document.getElementsByTagName('button')[0];
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
});
