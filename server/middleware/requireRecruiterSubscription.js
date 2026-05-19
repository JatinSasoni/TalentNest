import User from "../models/user-model.js";

const requireRecruiterSubscription = async (req, res, next) => {
  try {
    if (req.role !== "recruiter") {
      return res.status(403).json({
        MESSAGE: "Only recruiters can use this feature",
        SUCCESS: false,
      });
    }

    const user = await User.findById(req.id).select("subscription role");

    if (!user) {
      return res.status(404).json({
        MESSAGE: "User not found",
        SUCCESS: false,
      });
    }

    if (
      user.subscription?.expiryDate &&
      new Date() > new Date(user.subscription.expiryDate)
    ) {
      user.subscription.status = "expired";
      await user.save();
    }

    if (user.subscription?.status !== "active") {
      return res.status(402).json({
        MESSAGE: "Active subscription required to use AI features",
        SUCCESS: false,
        requiresSubscription: true,
      });
    }

    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    return res.status(500).json({
      MESSAGE: "Server error",
      SUCCESS: false,
    });
  }
};

export default requireRecruiterSubscription;
