const express = require("express");
const userRouter = express.Router();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const isAuthenticated = require("../middlewares/authMiddleware.js");
const otpLimiter = require("../middlewares/rateLimiter.js");
const { validate } = require("../middlewares/validationMiddleware.js");
const { authSchemas } = require("../utils/validationSchemas.js");

const { googleAuthCallback, linkedinAuthCallback, githubAuthCallback, loginUsingPass, sendLoginOtp, verifyLoginOtp, logout, refreshAccessToken, getCurrentUser, resendOtp, changePassword, sendSignupOtpForStudent, verifySignupOtpForStudent, sendSignupOtpForCollegeAdmin, verifySignupOtpForCollegeAdmin } = require("../controllers/userController.js");
const { authLimiter } = require("../utils/securityUtils.js");


// Login with Google(OAuth)

userRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
userRouter.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
}), googleAuthCallback);


// Login with LinkedIn (OAuth)
userRouter.get("/linkedin", passport.authenticate("linkedin"));
userRouter.get("/linkedin/callback", passport.authenticate("linkedin", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=linkedin_failed`
}), linkedinAuthCallback);

// Login with Github (OAuth)
userRouter.get("/github", passport.authenticate("github", { scope: ['user:email'] }));
userRouter.get("/github/callback", passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_failed`
}), githubAuthCallback);


// Login setup for all users
userRouter.post("/login", validate(authSchemas.login, 'body'), loginUsingPass);
userRouter.post("/login/send-otp", otpLimiter, validate(authSchemas.sendLoginOtp, 'body'), sendLoginOtp);
userRouter.post("/login/verify-otp", validate(authSchemas.verifyLoginOtp, 'body'), verifyLoginOtp);

// Signup as Student
userRouter.post("/signup/student/send-otp", otpLimiter, validate(authSchemas.sendSignupOtpStudent, 'body'), sendSignupOtpForStudent);
userRouter.post("/signup/student/verify-otp", validate(authSchemas.verifySignupOtpStudent, 'body'), verifySignupOtpForStudent);

// Create Account for College Admin --> sends request for approval to super admin
userRouter.post("/signup/college-admin/send-otp", otpLimiter, validate(authSchemas.sendSignupOtpCollegeAdmin, 'body'), sendSignupOtpForCollegeAdmin);
userRouter.post("/signup/college-admin/verify-otp", validate(authSchemas.verifySignupOtpCollegeAdmin, 'body'), verifySignupOtpForCollegeAdmin);

// Resend an in-progress signup / login OTP (reuses the stored payload).
userRouter.post("/otp/resend", otpLimiter, resendOtp);



userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/logout", logout);

userRouter.get("/user", isAuthenticated, getCurrentUser);
userRouter.post("/change-password", isAuthenticated, authLimiter, validate(authSchemas.changePassword, 'body'), changePassword);




module.exports = userRouter;