let stompClient = null;
let currentSubscription = null;

function connect() {
  const token = document.getElementById('token').value;

  if (!token) return alert('Please enter a JWT token');

  const brokerURL = 'ws://localhost:3000';

  stompClient = new StompJs.Client({
    brokerURL: brokerURL,
    connectHeaders: {
      authorization: token
    },
    debug: function (str) {
      console.log(str);
    },
    reconnectDelay: 0,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0
  });

  stompClient.onConnect = async function (frame) {
    localStorage.setItem('token', token);
    document.getElementById('status').innerText = 'Connected';
    document.getElementById('status').style.color = 'green';
    document.getElementById('btnDisconnect').disabled = false;
    await getPublicRooms();
  };

  stompClient.onStompError = function (frame) {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
    alert('Error: ' + frame.headers['message']);
  };

  stompClient.activate();
}

function disconnect() {
  if (stompClient !== null) {
    stompClient.deactivate();
  }
  document.getElementById('status').innerText = 'Disconnected';
  document.getElementById('status').style.color = 'black';
  document.getElementById('btnDisconnect').disabled = true;
  document.getElementById('panelSend').style.display = 'none';
  console.log('Disconnected');
}
