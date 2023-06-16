const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Benutzername und Raum von URL abrufen
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Chatraum betreten
socket.emit('joinRoom', { username, room });

// Raum und Nutzer anzeigen
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Nachricht vom Server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Nach unten scrollen
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Nachricht senden
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Nachrichtentext abrufen
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Nachricht an Server senden
  socket.emit('chatMessage', msg);

  // Eingabe löschen
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Nachricht an DOM ausgeben
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Raumname zum DOM hinzufügen
function outputRoomName(room) {
  roomName.innerText = room;
}

// Benutzer zum DOM hinzufügen
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt bevor ein Chatraum verlassen wird
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Bist du sicher, dass du den Chatraum verlassen willst?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
