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

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents>;
type IoType = Server<ClientToServerEvents, ServerToClientEvents>;

// when someone connects to the chat
const onConnection = (socket: SocketType, io: IoType) => {
  console.log("socket.data :>> ", socket.data);
  const content =
    socket.data.userId === null
      ? "An anonymous user has joined the chat"
      : `A user ${socket.data.displayName} has joined the chat`;
  console.log(content);
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
    author: socketData.displayName,
  });
};

// when someone disconnects from the chat
const onDisconnection = (socket: SocketType, io: IoType) => {
  const content =
    socket.data.userId === null
      ? "An anonymous user has disconnect from the chat"
      : `A user ${socket.data.displayName} has disconnected from the chat`;
  console.log(content);
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
    socket.data.userId = null;
    socket.data.username = "anonymous";
    socket.data.displayName = "anonymous";
    return next();
  }
  // verirying the access token
  // todo: get the new access token from the refresh token if it is expired
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
  // todo: parse cookies(jwt refresh token)
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: FRONTEND_URL,
    },
  });
  // checking the auth on connection(after login/signup)
  io.use(checkAuthMiddleware);
  io.on("connection", (socket) => {
    // checking auth every time you use a socket
    socket.use((_, next) => checkAuthMiddleware(socket, next));
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
