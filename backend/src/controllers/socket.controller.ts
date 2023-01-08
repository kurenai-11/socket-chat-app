import { nanoid } from "nanoid";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../types.js";
import http from "http";
import { FRONTEND_URL } from "../app.js";

// all socket logic will be here
export const initializeSocket = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: FRONTEND_URL,
    },
  });
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
};
