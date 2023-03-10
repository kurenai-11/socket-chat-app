import { nanoid } from "nanoid";
import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  UserMessage,
} from "../types.js";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { FRONTEND_URL } from "../app.js";
import { z } from "zod";
import { jwtTokenPayload } from "./auth.controller.js";

type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;
type IoType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;
type SocketData = {
  userId?: number;
  displayName: string;
  username: string;
};

// when someone connects to the chat
const onConnection = (socket: SocketType, io: IoType) => {
  const content =
    socket.data.userId === undefined
      ? "An anonymous user has joined the chat"
      : `A user ${socket.data.displayName} has joined the chat`;
  io.emit("user connected", {
    type: "serverMessage",
    id: nanoid(),
    content,
    date: new Date().toISOString(),
  });
};

// when someone sends a message to the chat
// todo: socket data is any for now, will fix later
const onSendMessage = (
  io: IoType,
  socketData: any,
  message: Partial<UserMessage>
) => {
  if (message.content === undefined) {
    return;
  }
  // broadcasting the message
  io.emit("message sent", {
    type: "userMessage",
    id: nanoid(),
    content: message.content,
    date: new Date().toISOString(),
    author: socketData.displayName,
  });
};

// when someone disconnects from the chat
const onDisconnection = (socket: SocketType, io: IoType) => {
  const content =
    socket.data.userId === null
      ? "An anonymous user has disconnect from the chat"
      : `A user ${socket.data.displayName} has disconnected from the chat`;
  io.emit("user disconnected", {
    type: "serverMessage",
    id: nanoid(),
    content,
    date: new Date().toISOString(),
  });
};

// check authentication middleware
const checkAuthMiddleware = (
  socket: SocketType,
  next: (err?: Error | undefined) => void
) => {
  const accessToken = z.string().safeParse(socket.handshake.auth.accessToken);
  // if there is no access token - anonymous user by default
  if (!accessToken.success) {
    socket.data.userId = undefined;
    socket.data.username = "anonymous";
    socket.data.displayName = "anonymous";
    return next();
  }
  try {
    const token: jwtTokenPayload = jwt.verify(
      accessToken.data,
      process.env.JWT_ACCESS_SECRET!
    ) as JwtPayload;
    // this shouldn't happen
    if (!token.userId || !token.username || !token.displayName)
      return next(new Error("Not authenticated"));
    // set the socket data so we know who this socket is
    socket.data.userId = token.userId;
    socket.data.username = token.username;
    socket.data.displayName = token.displayName;
    next();
  } catch (e) {
    // it will only go here if the token was tampered with
    return next(new Error("Not authenticated"));
  }
};

// main socket logic will be here
export const initializeSocket = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    any,
    SocketData
  >(server, {
    cors: {
      origin: FRONTEND_URL,
    },
  });
  // checking the auth on connection(after login/signup)
  io.use(checkAuthMiddleware);
  io.on("connection", (socket) => {
    onConnection(socket, io);
    // socket event handlers
    socket.on("send message", (message) =>
      onSendMessage(io, socket.data, message)
    );
    socket.on("disconnect", () => onDisconnection(socket, io));
    socket.on("error", (err) => {
      console.log("oh shoot!");
      console.log("err :>> ", err);
      socket.disconnect();
    });
  });
};
