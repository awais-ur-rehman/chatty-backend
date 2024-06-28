const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io configuration
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("joinRoom", ({ userName, chatPartnerName, room }) => {
    socket.join(room);
    console.log(`${userName} joined room: ${room}`);
  });

  socket.on("joinGroup", ({ userName, groupId }) => {
    socket.join(groupId);
    console.log(`${userName} joined group: ${groupId}`);
  });

  socket.on("sendMessage", (messageData) => {
    const room = [messageData.sender, messageData.receiver].sort().join("_");
    io.to(room).emit("receiveMessage", messageData);
    console.log(`Message sent to room ${room}:`, messageData);
  });

  socket.on("sendGroupMessage", (messageData) => {
    io.to(messageData.groupId).emit("receiveGroupMessage", messageData);
    console.log(
      `Group message sent to group ${messageData.groupId}:`,
      messageData
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});
