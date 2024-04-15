
document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Connect to Socket.io server
    const logoutIcon = document.querySelector('.logout-icon');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const profileIcon = document.getElementById('profile-icon');
    let userLoggedIn; 

  
    function addMessage(message, sender, imageSender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message2', sender);
    
        const senderImage = document.createElement('img');
        senderImage.src = imageSender; 
        senderImage.alt = 'Sender Image'; 
    
        const messageContent = document.createElement('p');
        messageContent.innerHTML = `<strong>${sender}:</strong> ${message}`;
    
        messageElement.appendChild(senderImage); 
        messageElement.appendChild(messageContent); 
    
        chatMessages.appendChild(messageElement);
        // Scroll to bottom of chat window
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    socket.on('chat message', ({ message, sender, image_sender }) => {
        addMessage(message, sender, image_sender); 
    });

    
    fetch('/api/user/data')
        .then(response => response.json())
        .then(data => {
            userLoggedIn = data.user;
        })
        .catch(error => console.error('Error fetching user data:', error));

    
    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        const sender = userLoggedIn.userName; 
        const image_sender = userLoggedIn.profilePic; 
        if (message.trim() !== '') {
            socket.emit('chat message', { message, sender, image_sender }); 
            messageInput.value = ''; 
        }
    });

    // Event listener for receiving a message
    // socket.on('chat message', ({ message, sender }) => {
    //     addMessage(message, sender); // Add received message to chat window
    // });
    logoutIcon.addEventListener('click', () => {
        fetch('/api/auth/logout', {
            method: 'GET',
            credentials: 'same-origin' 
        })
        .then(response => {
            if (response.ok) {
                
                window.location.href = '/api/auth/login';
            } else {
                console.error('Failed to logout');
            }
        })
        .catch(error => console.error('Error logging out:', error));
    });
    profileIcon.addEventListener('click', () => {
        
        window.location.href = `/api/profile`;

    });


      
   
});
