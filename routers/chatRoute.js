import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember, renameGroup, sendAttachments } from "../controllers/chatController.js";
import { attachmentsMulter } from "../middlewares/multer.js";
import { addMemberValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validateHandler } from "../lib/validators.js";

const router = express.Router();

router.use(isAuthenticated);

router.route("/new").post(newGroupValidator(), validateHandler,newGroupChat);
router.route("/my").get(getMyChats);
router.route("/my/groups").get(getMyGroups);
router.route("/addmembers").put(addMemberValidator(), validateHandler,addMembers);
router.route("/remove").put(  removeMemberValidator(),
validateHandler,removeMember);
router.route("/delete/:id").delete(chatIdValidator(), validateHandler,leaveGroup);
router.route("/attachment").post(attachmentsMulter,sendAttachmentsValidator(),
validateHandler,sendAttachments);
router.route("/messages/:id").get(chatIdValidator(), validateHandler,getMessages)


//get details rename delete
router.route("/:id").get(chatIdValidator(), validateHandler, getChatDetails)
.put(renameValidator(), validateHandler, renameGroup)
.delete(chatIdValidator(), validateHandler, deleteChat);

export default router;
