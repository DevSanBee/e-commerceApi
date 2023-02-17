const express = require("express");
const {
  createUser,
  loginUser,
  logOutUser,
  getAllUsers,
  resetPassword,
  forgetPassword,
  getUserProfile,
  updatePassword,
  updateUserProfile,
  getUserDetails,
  updateUser,
  deleteUser,
} = require("../controller/userController");
const {
  isAuthenticatedUser,
  verifyRole,
} = require("../middleWares/authMiddleWare");

const authRouter = express.Router();

authRouter.route("/admin/users").get(isAuthenticatedUser, verifyRole('admin'), getAllUsers);
authRouter
  .route("/admin/users/:id")
  .get(isAuthenticatedUser, verifyRole("admin"), getUserDetails)
  .put(isAuthenticatedUser, verifyRole("admin"), updateUser)
  .delete(isAuthenticatedUser, verifyRole("admin"), deleteUser)
authRouter.route("/auth/register").post(createUser);
authRouter.route("/auth/login").post(loginUser);
authRouter.route("/logout").get(logOutUser);
authRouter.route("/password/forget").post(forgetPassword);
authRouter.route("/password/reset/:token").put(resetPassword);
authRouter.route("/me/update").put(isAuthenticatedUser,updateUserProfile);
authRouter.route("/me").get(isAuthenticatedUser, getUserProfile);
authRouter
  .route("/password/update")
  .put(isAuthenticatedUser, updatePassword);

module.exports = authRouter;
