import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logOutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/mullter.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const routes = Router();

routes
    .route("/register")
    .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);
routes.route("/login").post(loginUser);

///sercure route

routes.route("/logout").post(verifyJWT, logOutUser);
routes.route("/refresh-token").post(refreshAccessToken);
routes.route("/change-password").post(verifyJWT, changeCurrentPassword);

routes.route("/current-user").get(verifyJWT, getCurrentUser);

routes
    .route("/avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

//// using parama
routes.route("/c/:username").get(verifyJWT, getUserChannelProfile);

routes.route("/history").get(verifyJWT, getWatchHistory);

export default routes;
