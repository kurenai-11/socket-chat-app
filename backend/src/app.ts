import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import { nanoid } from "nanoid";
import { ClientToServerEvents, ServerToClientEvents } from "./types.js";
import authRouter from "./routes/auth.route.js";

// load dotenv
dotenv.config();

// initializing prisma
export const prisma = new PrismaClient();

// initializing express and the socket http server
const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
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
app.use("/auth", authRouter);

// socket related
io.on("connection", (socket) => {
  console.log(`A user ${socket.id} connected.`);
  io.emit("user connected", {
    type: "serverMessage",
    id: nanoid(),
    content: `A user ${socket.id} connected to the chat...`,
    date: new Date().toISOString(),
  });
  // receiving sent message from the socket
  socket.on("send message", (message) => {
    console.log("message :>> ", message);
    if (message.content === undefined) {
      return;
    }
    // broadcasting the message
    io.emit("message sent", {
      type: "userMessage",
      id: nanoid(),
      content: message.content,
      date: new Date().toISOString(),
      author: message.author || "anonymous",
    });
  });
  socket.on("disconnect", () => {
    console.log(`A user ${socket.id} disconnected...`);
    io.emit("user disconnected", {
      type: "serverMessage",
      id: nanoid(),
      content: `A user ${socket.id} disconnected from the chat...`,
      date: new Date().toISOString(),
    });
  });
});

// starting the server
const port = process.env.PORT || 5000;

const main = async () => {
  await prisma.$connect();
  server.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
