import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import streamSocketHandler from "./sockets/streamSocket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", streamRoutes);
app.use("/api/user", userRoutes);

streamSocketHandler(io);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
