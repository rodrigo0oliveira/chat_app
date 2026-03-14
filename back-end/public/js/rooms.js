async function getPublicRooms() {
  const token = localStorage.getItem('token') ?? document.getElementById('token').value;
  const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  await fetch('/rooms/public', {
    headers: {
      'Authorization': authHeader
    }
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('list-public-rooms');
      list.innerHTML = '';
      data.forEach(room => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.innerText = room.name;
        btn.onclick = () => {
          const params = new URLSearchParams({ roomId: room.id, name: room.name });
          window.location.href = `/chat.html?${params.toString()}`;
        };
        li.appendChild(btn);
        list.appendChild(li);
      });
    })
    .catch(err => console.error('Error fetching public rooms:', err));
}

function joinRoom(roomId) {
  document.getElementById('destinationRoomId').value = roomId;
  document.getElementById('panelSend').style.display = 'block';
  subscribeRoom(roomId);
  findMessagesByRoomId(roomId);
}

function subscribeRoom(roomId) {
  if (!roomId) return alert('Enter Room ID to subscribe');

  if (currentSubscription) {
    currentSubscription.unsubscribe();
  }

  const destination = `/topic/rooms.${roomId}`;
  currentSubscription = stompClient.subscribe(destination, function (message) {
    showReceivedMessage(message.body);
  }, {
    type: 'PUBLIC'
  });
  console.log(`Subscribed to ${destination}`);

  document.getElementById('destinationRoomId').value = roomId;
}
