function sendMessage() {
  const roomId = document.getElementById('destinationRoomId').value;
  const content = document.getElementById('messageContent').value;

  if (!roomId || !content) return alert('Missing room or content');

  const payload = {
    roomId: roomId,
    content: content
  };

  const clientMessageId = crypto.randomUUID();

  stompClient.publish({
    destination: '/app/chat.sendMessage',
    headers: { 'message-id': clientMessageId },
    body: JSON.stringify(payload)
  });

  document.getElementById('messageContent').value = '';
}

function showReceivedMessage(message) {
  const ul = document.getElementById('messages');
  const li = document.createElement('li');

  try {
    const data = JSON.parse(message);
    li.innerText = `[${new Date(data.createdAt).toLocaleTimeString()}] Sender ${data.senderUsername}: ${data.content}`;
  } catch (e) {
    li.innerText = message;
  }

  ul.prepend(li);
}

async function findMessagesByRoomId(roomId) {
  const token = localStorage.getItem('token') ?? document.getElementById('token').value;
  const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  await fetch(`/messages/${roomId}/messages`, {
    headers: {
      'Authorization': authHeader
    }
  })
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById('messages');
      ul.innerHTML = '';
      data.forEach(msg => showReceivedMessage(JSON.stringify(msg)));
    })
    .catch(err => console.error('Error fetching messages:', err));
}
