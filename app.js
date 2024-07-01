import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import { corsOptions } from './constants/config.js';
import { CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, NEW_MESSAGE_ALERT, ONLINE_USERS, START_TYPING, STOP_TYPING } from './constants/events.js';
import { errorMiddleware } from './middlewares/error.js';
import Message from './models/messageSchema.js';
import { connectDB } from './utils/features.js';
import { v2 as cloudinary } from 'cloudinary';
import { socketAuthenticator } from './middlewares/auth.js';
import { getSockets } from './lib/helper.js';
import adminRoute from './routers/adminRoute.js';
import chatRoute from './routers/chatRoute.js';
import userRoute from './routers/userRoute.js';

// Initialize dotenv for environment variables
dotenv.config({ path: './.env' });

const app = express();
const port = 8080;
export const adminSecretKey = "bhavikvora113151";
export const envMode = process.env.NODE_ENV?.trim() || "PRODUCTION";

// DB Connection Initialize
connectDB();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECERET_KEY,
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// APIs
app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/admin', adminRoute);

// Home route
app.get('/', (req, res) => {
  res.send('Home is Calling');
});

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors:corsOptions,
});
app.set("io", io);

export const userSocketIDs = new Map();
const onlineUsers = new Set();

// Socket.io middleware for authentication
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res || {}, (err) => {
    socketAuthenticator(err, socket, next);
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  const user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id);
  // console.log('Connected user:', userSocketIDs);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(START_TYPING,({members,chatId})=>{
    // console.log("start-typing",chatId);
    const membersSocket = getSockets(members)
    socket.to(membersSocket).emit(START_TYPING,{chatId})
  })

  socket.on(STOP_TYPING,({members,chatId})=>{
    // console.log("stop_typing",chatId);
    const membersSocket = getSockets(members)
    socket.to(membersSocket).emit(STOP_TYPING,{chatId})
  });
  socket.on(CHAT_JOINED,({userId,members})=>{
    console.log("Chat Joined",userId);
    onlineUsers.add(userId.toString())
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS,Array.from(onlineUsers));

  });
  socket.on(CHAT_LEAVED,({userId,members})=>{
    console.log("Chat LEaved",userId);
    onlineUsers.delete(userId.toString())
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS,Array.from(onlineUsers));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    onlineUsers.delete(user._id.toString());
    userSocketIDs.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});

// Error middleware
app.use(errorMiddleware);

// Start the server
server.listen(port, () => {
  console.log(`Server is listening on port: ${port} ${envMode}`);
});
