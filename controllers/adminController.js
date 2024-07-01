import { TryCatch } from "../middlewares/error.js";
import Chat from "../models/chatSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";
import { cookieOptions } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";


export const adminLogin = TryCatch(async (req, res, next) => {
    const { secretKey } = req.body;
    const adminSecretKey = "bhavikvora113151" || "bhavik"
    const isMatched = secretKey === adminSecretKey;
  
    if (!isMatched) return next(new ErrorHandler("Invalid Admin Key", 401));
  
    const token = jwt.sign(secretKey, process.env.TOKEN_SECRET);
  
    return res
      .status(200)
      .cookie("chattu-admin-token", token, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 15,
      })
      .json({
        success: true,
        message: "Authenticated Successfully, Welcome BOSS",
      });
  });
export const adminLogout = TryCatch(async (req, res, next) => {
    return res
      .status(200)
      .cookie("chattu-admin-token", "", {
        ...cookieOptions,
        maxAge: 0,
      })
      .json({
        success: true,
        message: "Logged Out Successfully",
      });
  });
 export const getAdminData = TryCatch(async (req, res, next) => {
    return res.status(200).json({
      admin: true,
    });
  });
export const allUsers = TryCatch(async (req, res) => {
    const users = await User.find({});
  
    const transformedUsers = await Promise.all(
      users.map(async ({ name, username, avatar, _id }) => {
        const [groups, friends] = await Promise.all([
          Chat.countDocuments({ groupChat: true, members: _id }),
          Chat.countDocuments({ groupChat: false, members: _id }),
        ]);
  
        return {
          name,
          username,
          avatar: avatar.url,
          _id,
          groups,
          friends,
        };
      })
    );
  
    return res.status(200).json({
      status: "success",
      users: transformedUsers,
    });
  });

export const allChats = TryCatch(async (req, res) => {
    const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");
  
    const transformedChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, name, creator }) => {
        const totalMessages = await Message.countDocuments({ chat: _id });
  
        return {
          _id,
          groupChat,
          name,
          avatar: members.slice(0, 3).map((member) => member.avatar.url),
          members: members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url,
          })),
          creator: {
            name: creator?.name || "None",
            avatar: creator?.avatar.url || "",
          },
          totalMembers: members.length,
          totalMessages,
        };
      })
    );
  
    return res.status(200).json({
      status: "success",
      chats: transformedChats,
    });
  });

  export const allMessages = TryCatch(async (req, res) => {
    try {
      const messages = await Message.find({})
        .populate("sender", "name avatar")
        .populate("chat", "groupChat");
  
      const transformedMessages = messages.map(
        ({ content, attachments, _id, sender, createdAt, chat }) => ({
          _id,
          attachments,
          content,
          createdAt,
          chat: chat?._id,
          groupChat: chat?.groupChat,
          sender: sender ? {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar?.url,
          } : null,
        })
      );
  
      return res.status(200).json({
        success: true,
        messages: transformedMessages,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server Error",
        error: {
          statusCode: 500,
          details: error.message,
        },
      });
    }
  });
  

export const getDashboardStats = TryCatch(async (req, res) => {
    const [groupsCount, usersCount, messagesCount, totalChatsCount] =
      await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
      ]);
  
    const today = new Date();
  
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
  
    const last7DaysMessages = await Message.find({
      createdAt: {
        $gte: last7Days,
        $lte: today,
      },
    }).select("createdAt");
  
    const messages = new Array(7).fill(0);
    const dayInMiliseconds = 1000 * 60 * 60 * 24;
  
    last7DaysMessages.forEach((message) => {
      const indexApprox =
        (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
      const index = Math.floor(indexApprox);
  
      messages[6 - index]++;
    });
  
    const stats = {
      groupsCount,
      usersCount,
      messagesCount,
      totalChatsCount,
      messagesChart: messages,
    };
  
    return res.status(200).json({
      success: true,
      stats,
    });
  });
  

