import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import uploadToCloudinary from "../utils/cloudinary.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import validateObjectID from "../utils/validateMongooseObjectID.js";
import redis from "../utils/redis.js";
import { clearCache } from "../utils/clearCache.js";
import { enqueueEmailSafely } from "../utils/enqueueEmailSafely.js";
//HANDLING USER REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, role } = req.body;

    //CHECKING IF ALL FIELDS ARE THERE
    if (!username || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({
        MESSAGE: "Something is missing",
        SUCCESS: false,
      });
    }
    const lowerCaseEmail = email.toLowerCase();
    //IF EMAIL ALREADY EXISTS?
    const alreadyExists = await User.findOne({ email: lowerCaseEmail });
    if (alreadyExists) {
      return res.status(400).json({
        MESSAGE: "Email already exists",
        SUCCESS: false,
      });
    }

    //HASHING PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    //REGISTERING USER
    const user = await User.create({
      username,
      email: lowerCaseEmail,
      phoneNumber,
      password: hashedPassword,
      role: role,
    });

    const mailOption = {
      from: `"${process.env.COMPANY_NAME} Support" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Welcome to ${process.env.COMPANY_NAME}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Welcome to ${
            process.env.COMPANY_NAME
          }!</h2>
          <p style="color: #555;">Dear User (${
            role === "recruiter" ? "Recruiter" : "Job-seeker"
          }),</p>
          <p style="color: #555;">Thank you for registering with Job Portal. We are excited to have you on board.</p>
          <p style="color: #555;">You have successfully signed up with the email: <strong>${email}</strong>.</p>
          <p style="color: #555;">If you did not register or need any assistance, please contact our support team.</p>
          <p style="color: #555; text-align: center;">Best regards,<br>${
            process.env.COMPANY_NAME
          } Team</p>
        </div>
      `,
    };

    if (mailOption) {
      await enqueueEmailSafely("welcomeEmail", { mailOptions: mailOption });
    }

    return res.status(201).json({
      MESSAGE: "User Registered Successfully",
      SUCCESS: true,
    });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });

    console.log("ERROR WHILE REGISTERING USER ");
  }
};

//HANDLING USER LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // CHECKING IF ALL FIELDS ARE THERE
    if (!email || !password || !role) {
      return res.status(400).json({
        MESSAGE: "Something is missing",
        SUCCESS: false,
      });
    }

    // GETTING USER THROUGH EMAIL
    let user = await User.findOne({ email });

    // USER EXISTS? || REGISTERED EMAIL?
    if (!user) {
      return res.status(400).json({
        MESSAGE: "Invalid Email or Password",
        SUCCESS: false,
      });
    }

    // CHECKING ROLE SPECIFIED BY USER IS MATCHING WITH ROLE IN DB
    if (role !== user.role) {
      return res.status(400).json({
        MESSAGE: "Account does not exist with specified role",
        SUCCESS: false,
      });
    }

    // VALIDATING PASSWORD
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        MESSAGE: "Invalid Email or Password",
        SUCCESS: false,
      });
    }

    //  CHECK SUBSCRIPTION STATUS IF USER IS A RECRUITER
    if (user.role === "recruiter" && user.subscription?.id) {
      const now = new Date();
      if (user.subscription.expiryDate && now > user.subscription.expiryDate) {
        // SUBSCRIPTION HAS EXPIRED
        user.subscription.status = "expired";
        await user.save();
      }
    }

    // GENERATING TOKEN
    const tokenPayload = {
      userID: user._id,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // UPDATED USER OBJ TO BE SENT ON FRONTEND (PASSWORD SHOULD NOT BE SENT)
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      password: "",
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
      profile: user.profile,
      savedJobs: user.savedJobs,
      subscription: user.subscription, // Include subscription details in response
    };

    return res
      .status(200)
      .cookie("token", token, {
        // httpOnly: true, // Prevents client-side JS access
        // secure: true, // Only send cookie over HTTPS
        // sameSite: "None", // Allows cross-origin requests
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        MESSAGE: `Welcome back ${user.username}`,
        user,
        SUCCESS: true,
      });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
    console.log("ERROR WHILE LOGIN USER:", error);
  }
};

//HANDLING USER LOGOUT
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", {
        // httpOnly: true,
        // secure: true,
        // sameSite: "None",
        expires: new Date(0), // Force browser to remove cookie
      })
      .json({
        MESSAGE: "Logout successfully",
        SUCCESS: true,
      });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
    console.log("ERROR WHILE LOGOUT");
  }
};

//HANDLING USER PROFILE UPDATE
export const updateProfile = async (req, res) => {
  try {
    const { username, email, phoneNumber, bio, skills } = req.body;

    //resume
    const { file = [], profilePhoto = [] } = req.files || {};

    //CONVERTING SKILLS TO ARRAY FORMAT FROM STRING FORMAT
    let skillsArray = [];
    // Handle skills properly based on type
    if (Array.isArray(skills)) {
      skillsArray = skills; // Already an array, use as is
    } else if (typeof skills === "string") {
      skillsArray = skills.split(",").map((skill) => skill.trim());
    }

    const userID = req.id; //FROM MIDDLEWARE AUTHENTICATION
    let user = await User.findById(userID); //FETCHING USER DATA FROM DATABASE
    if (!user) {
      return res.status(400).json({
        MESSAGE: "USER NOT FOUND",
        SUCCESS: false,
      });
    }

    //UPDATING DATA
    if (username) user.username = username;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (email && emailRegex.test(email)) {
      user.email = email;
    }
    if (phoneNumber) user.phoneNumber = phoneNumber;
    user.profile.bio = bio;
    user.profile.skills = skillsArray;

    //--HANDLING CLOUDINARY--
    // Handling resume upload
    if (file[0]) {
      const resumeUrl = await uploadToCloudinary(file[0], "uploads/resumes");
      if (resumeUrl) {
        user.profile.resume = resumeUrl;
        user.profile.resumeOriginalName = file[0].originalname;
        user.profile.aiResumeReview = "";
        user.profile.aiResumeScore = undefined;
        user.profile.aiResumeReviewAt = undefined;
        user.profile.aiResumeReviewUrl = "";
      }
    }

    // Handling profile photo upload
    if (profilePhoto[0]) {
      const photoUrl = await uploadToCloudinary(
        profilePhoto[0],
        "uploads/profile_photos"
      );
      if (photoUrl) {
        user.profile.profilePhoto = photoUrl;
      }
    }

    await user.save();

    //UPDATED USER OBJ TO BE SENT ON FRONTEND (PASSWORD SHOULD NOT BE SENT IN RESPONSE)
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      password: "",
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      MESSAGE: "Profile updated successfully",
      user,
      SUCCESS: true,
    });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });

    console.log("ERROR WHILE UPDATING PROFILE");
  }
};
//HANDLE JOB POST SAVE  AND ALSO JOB UNSAVE LOGIC
export const saveJob = async (req, res) => {
  try {
    const userId = req.id; // Assuming user is authenticated
    const { jobId } = req.body;

    if (!userId || !jobId)
      return res
        .status(404)
        .json({ MESSAGE: "Something is missing", SUCCESS: false });

    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json({ MESSAGE: "User not found", SUCCESS: false });

    const isSaved = user.savedJobs.includes(jobId);
    const cacheKey = `user:savedJobs:${userId}`;

    if (isSaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
      await user.save();

      await clearCache([cacheKey]);

      return res.status(200).json({
        MESSAGE: "Job removed from saved list",
        user,
        SUCCESS: true,
      });
    } else {
      user.savedJobs.push(jobId);
      await user.save();
      await clearCache([cacheKey]);
      return res
        .status(200)
        .json({ MESSAGE: "Job saved successfully", SUCCESS: true, user });
    }
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//HANDLING FORGET PASSWORD
export const sendOTPForPass = async (req, res) => {
  try {
    const { email } = req.body;

    //NO EMAIL
    if (!email) {
      return res.status(400).json({
        MESSAGE: "Please provide registered email",
        SUCCESS: false,
      });
    }

    //USER EXISTS WITH PROVIDED EMAIL?
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        MESSAGE: "Account does not exist",
        SUCCESS: false,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP in Redis (5 min)
    try {
      await redis.set(`otp:${email}`, otp, "EX", 300);
    } catch (err) {
      console.error("Redis set error (sendOTPForPass):", err.message);
      return res
        .status(500)
        .json({ MESSAGE: "Failed to generate OTP", SUCCESS: false });
    }

    //SENDING OTP
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`, // Replace with your email
      to: user.email,
      subject: "Your OTP Code for Verification",
      html: `
        <p>Dear User,</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <h2 style="color: #2d89ef; text-align: center;">${otp}</h2>
        <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p><strong>${process.env.COMPANY_NAME}</strong></p>
      `,
    };
    await enqueueEmailSafely(
      "sendOTPEmail",
      { mailOptions },
      {
        attempts: 2,
        backoff: {
          type: "fixed",
          delay: 1000,
        },
        removeOnComplete: true,
      }
    );

    return res.status(200).json({
      MESSAGE: "OTP sent to your email",
      userID: user._id,
      SUCCESS: true,
    });
  } catch (error) {
    console.log("ERROR WHILE RESETTING PASSWORD");
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//VALIDATING PASSWORD OTP
export const validateOTPToChangePass = async (req, res) => {
  try {
    const { otp, userID } = req.body;

    if (!otp || !userID) {
      return res.status(400).json({
        MESSAGE: "Something is missing",
        SUCCESS: false,
      });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(400).json({
        MESSAGE: "User not found",
        SUCCESS: false,
      });
    }

    let storedOtp = null;
    try {
      storedOtp = await redis.get(`otp:${user.email}`);
    } catch (err) {
      console.error("Redis get error (validateOTPToChangePass):", err.message);
      return res.status(500).json({
        MESSAGE: "Could not verify OTP right now",
        SUCCESS: false,
      });
    }

    if (!storedOtp) {
      return res.status(400).json({
        MESSAGE: "OTP expired or not found",
        SUCCESS: false,
      });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({
        MESSAGE: "Invalid OTP",
        SUCCESS: false,
      });
    }

    // OTP verified — remove from Redis
    try {
      await redis.del(`otp:${user.email}`);
    } catch (err) {
      console.error("Redis del error (validateOTPToChangePass):", err.message);
    }

    const token = jwt.sign({ optVerified: true }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("auth", token, {
        // httpOnly: true, // Prevents client-side JS access
        // secure: true, // Only send cookie over HTTPS
        // sameSite: "None", // Allows cross-origin requests
        maxAge: 5 * 60 * 1000, //5 Minutes
      })
      .json({
        MESSAGE: "OTP VERIFIED",
        SUCCESS: true,
      });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });

    console.log("ERROR WHILE RESETTING PASSWORD");
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const auth = req.cookies.auth;

    //TOKEN EXISTS?
    if (!auth) {
      return res.status(401).json({
        MESSAGE: "Please do the OTP step",
        SUCCESS: false,
      });
    }

    try {
      const tokenDecode = jwt.verify(auth, process.env.SECRET_KEY);

      if (!tokenDecode) {
        return res.status(401).json({
          MESSAGE: "Not Authorized",
          SUCCESS: false,
        });
      }
    } catch (error) {
      return res.status(401).json({
        MESSAGE: "Not Authorized",
        SUCCESS: false,
      });
    }

    const { userID, newPassword } = req.body;

    if (!userID || !newPassword) {
      return res.status(400).json({
        MESSAGE: "Something is missing",
        SUCCESS: false,
      });
    }
    const user = await User.findById(userID);

    if (!user) {
      return res.status(400).json({
        MESSAGE: "User not found",
        SUCCESS: false,
      });
    }

    //HASHING PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
      to: user.email, // User's email
      subject: "Password Changed Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Password Changed Successfully</h2>
          <p>Hello ${user.username},</p>
          <p>Your password has been changed successfully.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Thank you for using our service!</p>
          <br/>
          <p>Best Regards,</p>
          <p>${process.env.COMPANY_NAME}</p>
        </div>
      `,
    };

    await enqueueEmailSafely("passwordChangeEmail", { mailOptions });

    return res.status(200).clearCookie("auth").json({
      MESSAGE: "Password Changed",
      SUCCESS: true,
    });
  } catch (error) {
    console.log("ERROR WHILE CHANGING PASSWORD");
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//GET USER INFO FOR ADMIN
export const getUserForAdmin = async (req, res) => {
  try {
    const applicantID = req.params.applicantID;

    if (!applicantID || !validateObjectID(applicantID)) {
      return res
        .status(400)
        .json({ SUCCESS: false, MESSAGE: "Something went wrong" });
    }

    // Fetch user from database
    const user = await User.findById(applicantID);

    // If user not found
    if (!user) {
      return res
        .status(404)
        .json({ SUCCESS: false, MESSAGE: "User not found" });
    }

    // Send user data
    res.status(200).json({ SUCCESS: true, MESSAGE: "Found", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

export const createOrder = async (req, res) => {
  try {
    const userID = req.id;

    if (!userID) {
      return res
        .status(400)
        .json({ MESSAGE: "ID is required", SUCCESS: false });
    }

    const user = await User.findById(userID);

    if (!user || user.role === "student") {
      return res
        .status(400)
        .json({ MESSAGE: "You cannot subscribe", SUCCESS: false });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZOR_PAY_KEY,
      key_secret: process.env.RAZOR_PAY_SECRET,
    });

    const subscription = await instance.subscriptions.create({
      plan_id: process.env.RAZOR_PLAN_ID || "plan_QB21Cvk6UZg5Wi",
      customer_notify: 1,
      total_count: 6,
      notes: {
        customerID: userID?.toString(), // Store Mongoose ID
      },
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    return res
      .status(201)
      .json({ MESSAGE: "OK", SUCCESS: true, subscriptionID: subscription.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // CHECK IF ALL REQUIRED FIELDS ARE PRESENT
    if (
      !razorpay_subscription_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        SUCCESS: false,
        MESSAGE: "Missing required payment details",
      });
    }

    // GET THE USER FROM DATABASE
    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({
        SUCCESS: false,
        MESSAGE: "User not found",
      });
    }

    // VERIFY THE SIGNATURE
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_SECRET)
      .update(razorpay_payment_id + "|" + razorpay_subscription_id, "utf-8") // Correct Order
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        SUCCESS: false,
        MESSAGE: "Payment verification failed",
      });
    }

    // UPDATE USER SUBSCRIPTION STATUS & EXPIRY DATE (30 days from now)
    user.subscription = {
      id: razorpay_subscription_id,
      status: "active",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from today
    };

    await user.save();

    //Invalidate "featured jobs" cache
    await clearCache(["jobs:get:featured*", "jobs:get:featured*"]);

    // SEND JSON RESPONSE INSTEAD OF REDIRECT
    let userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      password: "",
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
      profile: user.profile,
      savedJobs: user.savedJobs,
      subscription: user.subscription, // Include subscription details in response
    };

    return res.status(200).json({
      SUCCESS: true,
      MESSAGE: "Payment successful",
      userData, // Updated user details
    });
  } catch (error) {
    console.error("Error in payment verification:", error);
    res.status(500).json({
      SUCCESS: false,
      MESSAGE: "Server error",
    });
  }
};
