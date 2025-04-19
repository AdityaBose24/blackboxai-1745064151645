const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

function appendMessage(content, sender = 'user') {
  const messageElem = document.createElement('div');
  messageElem.classList.add('max-w-xl', 'p-3', 'rounded', 'shadow', 'break-words');
  if (sender === 'user') {
    messageElem.classList.add('bg-blue-100', 'self-end', 'text-right');
  } else {
    messageElem.classList.add('bg-gray-100', 'self-start', 'text-left');
  }
  messageElem.textContent = content;
  chatContainer.appendChild(messageElem);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage(message) {
  appendMessage(message, 'user');
  userInput.value = '';
  appendMessage('Typing...', 'bot');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // Remove the "Typing..." message
    const typingElem = chatContainer.querySelector('div.bg-gray-100:last-child');
    if (typingElem && typingElem.textContent === 'Typing...') {
      typingElem.remove();
    }
    appendMessage(data.reply, 'bot');
  } catch (error) {
    // Remove the "Typing..." message
    const typingElem = chatContainer.querySelector('div.bg-gray-100:last-child');
    if (typingElem && typingElem.textContent === 'Typing...') {
      typingElem.remove();
    }
    appendMessage('Error: Could not get response. Please try again later.', 'bot');
    console.error('Error fetching chat response:', error);
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message) {
    sendMessage(message);
  }
});
