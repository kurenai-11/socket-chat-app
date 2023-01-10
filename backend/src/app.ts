import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth.route.js";
import { initializeSocket } from "./controllers/socket.controller.js";
import cookieParser from "cookie-parser";

// load dotenv
dotenv.config();

export const FRONTEND_URL = "http://192.168.1.200:5173";

// initializing prisma
export const prisma = new PrismaClient();

// initializing express
const app = express();
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
// creating socket server
const server = http.createServer(app);
initializeSocket(server);

// routes
app.get("/", (req, res) => {
  res.send("yes the server is working");
});
app.use("/auth", authRouter);

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
