const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
require("dotenv").config();
const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Statischen Ordner festlegen
app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat-Senfl Bot";

(async () => {
  pubClient = createClient({ url: "redis://127.0.0.1:6379" });
  await pubClient.connect();
  subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
})();

// Ausführen wenn der Client eine Verbindung herstellt
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Begrüssungstext für den aktuellen Benutzer
    socket.emit("message", formatMessage(botName, "Willkommen bei Chat-Senfl!"));

    // Broadcast wenn ein Benutzer eine Verbindung herstellt
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} hat den Chat betreten`)
      );

    // Benutzer und Rauminformationen senden
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Abrufen der Chat-Nachricht
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Wird ausgeführt wenn der Client die Verbindung trennt
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} hat den Chat verlassen`)
      );

      // Benutzer und Rauminformationen senden
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
