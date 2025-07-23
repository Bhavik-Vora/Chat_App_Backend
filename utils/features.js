import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { v4 as uuid } from "uuid";
dotenv.config({path:"../.env"});
import { v2 as cloudinary } from 'cloudinary';
import { getBase64, getSockets } from "../lib/helper.js";
export const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "none", // Adjust according to your requirements
    httpOnly: true,
    secure: true,
};

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://testing:dTfMEXe2vltooc1D@webchat.0cnh0.mongodb.net/");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        
    }
};
const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  return res.status(code).cookie("chattu-token", token, cookieOptions).json({
    success: true,
    user,
    message,
  });
};


const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};
const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error("Error uploading files to cloudinary", err);
  }
};


const deletFilesFromCloudinary = async (public_ids) => {
  // Delete files from cloudinary
};


export { connectDB, sendToken,emitEvent,deletFilesFromCloudinary,uploadFilesToCloudinary}
