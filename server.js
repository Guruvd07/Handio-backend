
import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

/* ROUTES */
import providerRoutes from "./routes/providerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/messages.js";

/* MODELS */
import Message from "./models/Message.js";

dotenv.config();

const app = express();

/* ===========================
   CREATE HTTP SERVER
=========================== */

const server = http.createServer(app);

/* ===========================
   SOCKET.IO SETUP
=========================== */

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://handio-frontend.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});


io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {

    console.log("User joined room:", userId);

    socket.join(userId);

  });

  socket.on("send_message", async (data) => {

    console.log("Message received:", data);

    try {

      const { sender, receiver, message } = data;

      const newMessage = new Message({
        sender,
        receiver,
        message
      });

      await newMessage.save();

      console.log("Saved message:", newMessage);

      io.emit("receive_message", newMessage);

    } catch (err) {

      console.error("Socket message error:", err);

    }

  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});


/* ===========================
   SECURITY & PERFORMANCE
=========================== */

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://handio-frontend.onrender.com"
    ],
    credentials: true
  })
);

app.use(express.json());

/* ===========================
   ROUTES
=========================== */

app.use("/providers", providerRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/messages", messageRoutes);

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/", (req, res) => {
  res.send("Handio Backend Running");
});

/* ===========================
   DATABASE
=========================== */

connectDB();

/* ===========================
   SERVER START
=========================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

