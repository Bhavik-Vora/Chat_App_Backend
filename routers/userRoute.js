import express from "express";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getmyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest
} from "../controllers/userController.js";
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler
} from "../lib/validators.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleAvatar } from "../middlewares/multer.js";

const router = express.Router();

router.route("/").get(login);
router
  .route("/createUser")
  .post(singleAvatar, registerValidator(), validateHandler, newUser);
router.route("/login").post(loginValidator(), validateHandler, login);

router.use(isAuthenticated);
router.route("/profile").get(getmyProfile);
router.route("/logout").get(logout);
router.get("/search", searchUser);
router.put(
  "/sendFriendRequest",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);

router.put(
  "/acceptrequest",
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest
);
router.get("/notifications", getMyNotifications);
router.get("/friends",getMyFriends)
export default router;
