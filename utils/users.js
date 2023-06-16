const users = [];

// Benutzer zum Chat hinzufügen
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Aktuellen Benutzer abrufen
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// Benutzer verlässt den Chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Benutzer eines Chatraumes abrufen
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
