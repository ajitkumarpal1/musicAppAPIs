import express from "express";
import { user } from "../src/controllers/users_controller.js";
import { auth } from "../middlewares/auth.js";
const usersRouter = express.Router();

usersRouter.get("/auth-check",auth,user.authCheck);
usersRouter.post("/signup", user.signup);
usersRouter.post("/signin", user.signin);
usersRouter.post("/:email/verify", user.verify);
usersRouter.get("/signout", user.signout);
usersRouter.post("/resetpassword", user.resetpassword);
usersRouter.post("/updatepassword", user.updatepassword);  

export default usersRouter;
