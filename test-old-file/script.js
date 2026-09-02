$(document).ready(function() {
    const projectId = 'YOUR_PROJECT_ID';
    const sessionId = generateSessionId();
    const languageCode = 'en-US';

    function generateSessionId() {
        return Math.random().toString(36).substring(7);
    }

    function sendRequest(message) {
        $.ajax({
            type: 'POST',
            url: `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                queryInput: {
                    text: {
                        text: message,
                        languageCode: languageCode,
                    },
                },
            }),
            headers: {
                Authorization: 'Bearer YOUR_ACCESS_TOKEN',
            },
            success: function(response) {
                const fulfillmentText = response.queryResult.fulfillmentText;
                displayMessage(fulfillmentText, 'bot');
                sendNotification(fulfillmentText); // Send notification after receiving response
            },
            error: function(xhr, textStatus, errorThrown) {
                console.error('Error:', errorThrown);
            },
        });
    }

    function displayMessage(message, sender) {
        const chatMessages = $('#chat-messages');
        const messageClass = sender === 'bot' ? 'bot-message' : 'user-message';
        chatMessages.append(`<div class="${messageClass}">${message}</div>`);
        chatMessages.scrollTop(chatMessages[0].scrollHeight); // Scroll to bottom
    }

    $('#send-btn').click(function() {
        sendMessage();
    });

    $('#user-input').keypress(function(event) {
        if (event.which === 13) {
            sendMessage();
        }
    });

    function sendMessage() {
        const userInput = $('#user-input').val().trim();
        if (userInput !== '') {
            displayMessage(userInput, 'user');
            sendRequest(userInput);
            $('#user-input').val('');
        }
    }

    function sendNotification(message) {
        if (!("Notification" in window)) {
            console.error("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            new Notification("New Message", { body: message });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    new Notification("New Message", { body: message });
                }
            });
        }
    }

    $('nav a').click(function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            const hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function(){
                window.location.hash = hash;
            });
        }
    });
    

    // Request permission for notifications when the page loads
    if ("Notification" in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }




});
