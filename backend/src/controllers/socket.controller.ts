import { nanoid } from "nanoid";
import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  UserMessage,
} from "../types.js";
import http from "http";
import { FRONTEND_URL } from "../app.js";

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents>;
type IoType = Server<ClientToServerEvents, ServerToClientEvents>;

// when someone connects to the chat
const onConnection = (socket: SocketType, io: IoType) => {
  console.log(`A user ${socket.id} connected.`);
  io.emit("user connected", {
    type: "serverMessage",
    id: nanoid(),
    content: `A user ${socket.id} connected to the chat...`,
    date: new Date().toISOString(),
  });
};

// when someone sends a message to the chat
const onSendMessage = (io: IoType, message: Partial<UserMessage>) => {
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
};

// when someone disconencts from the chat
const onDisconnection = (socket: SocketType, io: IoType) => {
  console.log(`A user ${socket.id} disconnected...`);
  io.emit("user disconnected", {
    type: "serverMessage",
    id: nanoid(),
    content: `A user ${socket.id} disconnected from the chat...`,
    date: new Date().toISOString(),
  });
};

// main socket logic will be here
export const initializeSocket = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: FRONTEND_URL,
    },
  });
  io.on("connection", (socket) => {
    onConnection(socket, io);
    socket.on("send message", (message) => onSendMessage(io, message));
    socket.on("disconnect", () => onDisconnection(socket, io));
  });
};
