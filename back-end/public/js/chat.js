let stompClient = null;
let currentSubscription = null;

const params = new URLSearchParams(window.location.search);
const roomId = params.get('roomId');
const roomName = params.get('name') ?? 'Chat';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('room-name').innerText = roomName;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not logged in. Redirecting to home...');
    window.location.href = '/client.html';
    return;
  }

  stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:3000',
    connectHeaders: { authorization: token },
    debug: (str) => console.log(str),
    reconnectDelay: 0,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0
  });

  stompClient.onConnect = async function () {
    await loadHistory();
    subscribeRoom();
  };

  stompClient.onStompError = function (frame) {
    console.error('STOMP error:', frame.headers['message']);
  };

  stompClient.activate();

  document.getElementById('messageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
});

async function loadHistory() {
  const token = localStorage.getItem('token');
  const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  try {
    const res = await fetch(`/messages/${roomId}/messages`, {
      headers: { 'Authorization': authHeader }
    });
    const data = await res.json();
    const ul = document.getElementById('messages');
    ul.innerHTML = '';
    data.forEach(msg => appendMessage(msg));
    scrollToBottom();
  } catch (err) {
    console.error('Error loading history:', err);
  }
}

function subscribeRoom() {
  if (currentSubscription) currentSubscription.unsubscribe();

  currentSubscription = stompClient.subscribe(`/topic/rooms.${roomId}`, (message) => {
    try {
      const data = JSON.parse(message.body);
      appendMessage(data);
      scrollToBottom();
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  }, { type: 'PUBLIC' });
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const content = input.value.trim();
  if (!content) return;

  stompClient.publish({
    destination: '/app/chat.sendMessage',
    headers: { 'message-id': crypto.randomUUID() },
    body: JSON.stringify({ roomId, content })
  });

  input.value = '';
}

function appendMessage(data) {
  const ul = document.getElementById('messages');
  const li = document.createElement('li');
  const time = new Date(data.createdAt).toLocaleTimeString();
  const sender = data.senderUsername;
  li.innerHTML = `<span class="time">${time}</span> <span class="sender">${sender}</span> ${escapeHtml(data.content)}`;
  ul.appendChild(li);
}

function scrollToBottom() {
  const ul = document.getElementById('messages');
  ul.scrollTop = ul.scrollHeight;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
