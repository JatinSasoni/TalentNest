import Contact from "../models/contact-model.js";
import User from "../models/user-model.js";
import { enqueueEmailSafely } from "../utils/enqueueEmailSafely.js";
import { clearCache } from "../utils/clearCache.js";
import redis from "../utils/redis.js";

//CONTACT PAGE
export const contactController = async (req, res) => {
  try {
    const { username, email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        MESSAGE: "Something is missing",
        SUCCESS: false,
      });
    }

    const isRegisteredUser = await User.findOne({ email });

    //IF USER IS REGISTERED STORE DATA
    if (isRegisteredUser) {
      const postedContactData = await Contact.create({
        userID: isRegisteredUser._id,
        message,
        isApproved: false,
      });
    }

    const mailOption = {
      from: email,
      to: "jatinhubhai6284@gmail.com", // Recruiter's email
      subject: "New Contact Form Submission",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 10px; width: 600px; margin: auto;">
          <h2 style="color: #333; text-align: center;">Contact Form Submission</h2>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #555;">
              <strong>Name:</strong> ${username}
            </p>
            <p style="font-size: 16px; color: #555;">
              <strong>Email:</strong> ${email}
            </p>
            <p style="font-size: 16px; color: #555;">
              <strong>Message:</strong>
            </p>
            <div style="padding: 10px; background-color: #f9f9f9; border-left: 4px solid #007bff; margin-bottom: 20px;">
              ${message}
            </div>
            <p style="font-size: 14px; color: #777; text-align: center;">
              Kindly reach out to the user as soon as possible.
            </p>
          </div>
        </div>
      `,
    };

    await enqueueEmailSafely("contactFormSubmission", {
      mailOptions: mailOption,
    });

    await clearCache(["talentNest:approvedContacts"]);

    return res.status(200).json({
      MESSAGE: "Your message has been sent successfully!",
      SUCCESS: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

// Website reviews
export const getAllContacts = async (req, res) => {
  try {
    const cacheKey = "talentNest:approvedContacts";

    try {
      const reviews = await redis.get(cacheKey);
      if (reviews) {
        return res.status(200).json({
          MESSAGE: "Contacts found",
          allContacts: JSON.parse(reviews),
          SUCCESS: true,
        });
      }
    } catch (error) {
      console.error("Redis error:", error?.message);
    }

    const allContacts = await Contact.find({ isApproved: true })
      .populate("userID", "username profile.profilePhoto role")
      .sort({ createdAt: -1 })
      .limit(10);

    if (!allContacts) {
      return res.status(400).json({
        MESSAGE: "Currently no contact",
        SUCCESS: false,
      });
    }

    try {
      await redis.set(cacheKey, JSON.stringify(allContacts), "EX", 3600);
    } catch (err) {
      console.error("Redis error (getFeaturedJobs):", err.message);
    }

    return res.status(200).json({
      MESSAGE: "Contacts found",
      allContacts,
      SUCCESS: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};
