import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { nanoid } from "nanoid";

// initializing express and the socket http server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// express related
app.use(express.json());
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.send("yes the server is working");
});

// socket related
io.on("connection", (socket) => {
  console.log(`A user ${socket.id} connected.`);
  io.emit("user connected", {
    type: "serverMessage",
    id: nanoid(),
    content: `A user ${socket.id} connected to the chat...`,
    date: new Date(),
  });
  socket.on("disconnect", () => {
    console.log(`A user ${socket.id} disconnected...`);
    io.emit("user disconnected", {
      type: "serverMessage",
      id: nanoid(),
      content: `A user ${socket.id} disconnected from the chat...`,
      date: new Date(),
    });
  });
});

// starting the server
const port = process.env.PORT || 5000;

// iife for future async stuff
(async () => {
  server.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
})();
