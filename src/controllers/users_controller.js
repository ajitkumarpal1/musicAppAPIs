import User from "../models/user.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../../utils/errorHandler.js";
import { sendToken } from "../../utils/sendToken.js";
import { otp } from "../../middlewares/otp.js";
import { resetotp } from "../../middlewares/resetotp.js";

export const user = {
    authCheck:(req,res)=>{
        res.json(req.user)
    },
    signup: async (req, res, next) => {
        const { name, email, password } = req.body;
        console.log(req.body)
        try {
            const newUser = new User({ name, email, password });
            await newUser.save();
            await otp(newUser);
            res.status(201).json({ status: true, message: "Signup successful. OTP sent to email." });
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.email) {
                return next(new ErrorHandler(400, "Email already exists"));
            }
            return next(new ErrorHandler(400, error.message));
        }
    },

    signin: async (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler(400, "Please enter email and password"));
        }

        try {
            const user = await User.findOne({ email }).select("+password");

            if (!user) {
                return next(new ErrorHandler(401, "User not found! Please register"));
            }

            const passwordMatch = await user.comparePassword(password);

            if (!passwordMatch) {
                return next(new ErrorHandler(401, "Invalid email or password"));
            }

            if (!user.status) {
                return res.status(401).json({
                    success: false,
                    message: "Your account is not verified"
                });
            }

            await sendToken(user, res, 200);
        } catch (error) {
            return next(new ErrorHandler(400, error.message));
        }
    },

    verify: async (req, res, next) => {
        const { email } = req.params;
        const { otp: receivedOtp } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Email not found"
                });
            }

            if (user.tampOtp !== receivedOtp) {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect OTP"
                });
            }

            user.status = true;
            user.tampOtp = undefined; // Remove the OTP after verification
            await user.save();

            res.json({
                success: true,
                message: "You are verified"
            });
        } catch (error) {
            return next(new ErrorHandler(400, error.message));
        }
    },

    signout: (req, res, next) => {
        try {
            res.cookie("token", "", { expires: new Date(0) }).json({
                success: true,
                message: "Signed out successfully"
            });
        } catch (error) {
            return next(new ErrorHandler(400, error.message));
        }
    },

    resetpassword: async (req, res, next) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return next(new ErrorHandler(404, "Email not found"));
            }

            user.status = false;
            user.tampOtp = Math.floor(1000 + Math.random() * 9000); // Generate a new OTP
            await user.save();

            await resetotp({ email });

            res.cookie("token", "", { expires: new Date(0) });
            res.status(200).redirect(`/resetpassword?email=${email}`);
        } catch (error) {
            return next(new ErrorHandler(400, error.message));
        }
    },

    updatepassword: async (req, res, next) => {
        const { email, otp: receivedOtp, password } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user || user.tampOtp !== receivedOtp) {
                return res.status(400).json({ success: false, message: "Incorrect OTP or email" });
            }

            user.password = password;
            user.status = true;
            user.tampOtp = undefined; // Remove the OTP after password update
            await user.save();

            res.json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
};
