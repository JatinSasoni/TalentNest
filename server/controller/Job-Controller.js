import Application from "../models/application-model.js";
import Job from "../models/job-model.js";
import User from "../models/user-model.js";
import validateObjectID from "../utils/validateMongooseObjectID.js";
import redis from "../utils/redis.js";
import { clearCache } from "../utils/clearCache.js";
import { enqueueEmailSafely } from "../utils/enqueueEmailSafely.js";
import { parseRequirements } from "../utils/parseRequirements.js";

//CREATE JOB API FOR AUTHENTICATED ADMIN
export const postJobForAdmin = async (req, res) => {
  try {
    //DESTRUCTURING DATA
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      position,
      experienceLevel,
      CompanyID,
    } = req.body;

    const userID = req.id; //MIDDLEWARE

    const user = await User.findById(userID);

    if (!user || user.role !== "recruiter") {
      return res.status(400).json({
        MESSAGE: "User not found",
        SUCCESS: false,
      });
    }

    const requirementArray = parseRequirements(requirements);

    const postedJob = await Job.create({
      title,
      description,
      requirements: requirementArray,
      salary: Number(salary),
      location,
      jobType,
      position: Number(position),
      experienceLevel: Number(experienceLevel),
      CompanyID,
      createdBy: userID,
    });

    // SENDING MAIL
    const mailOption = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
      to: user.email, // recruiter's email
      subject: `Job Posting Confirmation - ${process.env.COMPANY_NAME}`,
      text: `Dear Recruiter,

    Your job posting has been successfully published on ${
      process.env.COMPANY_NAME
    }.

    Job Details:
    - Title: ${postedJob.title}
    - Location: ${postedJob.location}
    - Job Type: ${postedJob.jobType}
    - Position: ${postedJob.position}
    - Experience : ${postedJob.experienceLevel}
    - Salary: ${
      postedJob.salary ? `${postedJob.salary} (LPA)` : "Not specified"
    }

    Thank you for choosing ${
      process.env.COMPANY_NAME
    } to connect with top talent. If you need any modifications or assistance, feel free to contact our support team.

    Best regards,
    ${process.env.COMPANY_NAME} Team`,
    };

    await enqueueEmailSafely("jobPostingConfirmation", {
      mailOptions: mailOption,
    });

    await clearCache([
      "jobs:all:*",
      "jobs:get:featured*",
      `jobs:info:admin:posted:${userID}`,
    ]);

    return res.status(201).json({
      MESSAGE: "Job Posted Successfully",
      postedJob,
      SUCCESS: true,
    });
  } catch (error) {
    console.error("postJobForAdmin error:", error);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

export const editJobPost = async (req, res) => {
  try {
    const { jobID } = req.params; // Get Job ID from URL params
    const userId = req.id; // Get logged-in user's ID (assuming authentication middleware)

    if (!jobID || !validateObjectID(jobID)) {
      return res
        .status(400)
        .json({ SUCCESS: false, MESSAGE: "Something went wrong" });
    }

    // Fields that can be updated
    const updatableFields = [
      "title",
      "description",
      "requirements",
      "salary",
      "location",
      "jobType",
      "position",
      "experienceLevel",
      "CompanyID",
    ];

    // Create an update object with only provided fields
    const updateData = {};
    updatableFields.forEach((field) => {
      if (req.body[field] && req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.requirements) {
      updateData.requirements = updateData.requirements
        .split(",")
        .map((elem) => elem.trim());
    }

    // Check if job exists
    const job = await Job.findById(jobID);
    if (!job) {
      return res.status(404).json({ MESSAGE: "Job not found", SUCCESS: false });
    }

    // Ensure only the creator or admin can edit the job
    if (job.CompanyID.toString() !== userId && req.role !== "recruiter") {
      return res
        .status(403)
        .json({ MESSAGE: "Unauthorized to edit this job", SUCCESS: false });
    }

    // Update the job post
    const updatedJob = await Job.findByIdAndUpdate(
      jobID,
      { $set: updateData },
      { new: true, runValidators: true } //By default, findByIdAndUpdate() bypasses schema validation.
    );

    await clearCache([
      "jobs:all:*",
      "jobs:get:featured*",
      `job:info:${jobID}`,
      `job:info:admin:${jobID}`,
      "user:savedJobs:*",
      `jobs:info:admin:posted:${userId}`,
    ]);

    res.status(200).json({
      MESSAGE: "Job post updated successfully",
      job: updatedJob,
      SUCCESS: true,
    });
  } catch (error) {
    console.error("Error updating job post:", error);
    res.status(500).json({ MESSAGE: "Internal server error", SUCCESS: false });
  }
};

//API FOR FETCHING JOBS FOR STUDENT || JobSEEKER

export const getAllJobs = async (req, res) => {
  try {
    //Keyword IS A QUERY STRING CONTAINING USER APPLIED FILTER FOR JOB LIKE "Frontend Dev"
    const keyword = req.query.keyword || ""; //BY DEFAULT "" MEANS EVERY DOCUMENT WILL RETURN
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    //unique cache key based on query parameters
    const cacheKey = `jobs:all:keyword=${keyword}:page=${page}:limit:${limit}`;
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (err) {
      console.error("Redis get error (getAllJobs):", err.message);
    }

    const query = {
      //RETURNS DOCUMENTS WITH EITHER TITLE OR DESCRIPTION MATCHED THROUGH $regex
      // $options: "i" = CASE-INSENSITIVE
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    const totalJobs = await Job.countDocuments(query);
    const allJobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate("CompanyID")
      .skip(skip)
      .limit(limit);

    const responseData = {
      MESSAGE: `Jobs found ${allJobs.length}`,
      allJobs,
      page,
      limit,
      totalJobs,
      SUCCESS: true,
    };

    // Step 3: Cache the result for 10 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 600);
    } catch (err) {
      console.error("Redis set error (getAllJobs):", err.message);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//API FOR FETCHING JOB DESCRIPTION BY JOB-ID FOR STUDENT
export const getJobInfoById = async (req, res) => {
  try {
    const jobID = req.params.jobID;

    if (!jobID || !validateObjectID(jobID)) {
      return res
        .status(400)
        .json({ SUCCESS: false, MESSAGE: "Something went wrong" });
    }

    const cacheKey = `job:info:${jobID}`;
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          MESSAGE: `Jobs found successfully`,
          job: JSON.parse(cachedData),
          SUCCESS: true,
        });
      }
    } catch (err) {
      console.error("Redis get error (jobinfobyid):", err.message);
    }

    const job = await Job.findById(jobID)
      .populate("CompanyID")
      .populate("application");

    //INVALID JOB_ID OR NO JOB WITH SUC JOB_ID
    if (!job) {
      return res.status(400).json({
        MESSAGE: "Job not found",
        SUCCESS: false,
      });
    }

    try {
      await redis.set(cacheKey, JSON.stringify(job), "EX", 300);
    } catch (err) {
      console.error("Redis set error (getJobInfoById):", err.message);
    }
    return res.status(200).json({
      MESSAGE: `Jobs found successfully`,
      job,
      SUCCESS: true,
    });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//API FOR FETCHING JOB DESCRIPTION BY JOB-ID FOR RECRUITER
export const getJobInfoByIdForAdmin = async (req, res) => {
  try {
    const jobID = req.params.jobID;

    if (!jobID || !validateObjectID(jobID)) {
      return res
        .status(400)
        .json({ SUCCESS: false, MESSAGE: "Something went wrong" });
    }

    // Ensure only the creator or admin can edit the job
    if (req.role !== "recruiter") {
      return res
        .status(403)
        .json({ MESSAGE: "Unauthorized to edit this job", SUCCESS: false });
    }

    const cacheKey = `job:info:admin:${jobID}`;
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          MESSAGE: `Jobs found successfully`,
          job: JSON.parse(cachedData),
          SUCCESS: true,
        });
      }
    } catch (err) {
      console.error("Redis get error (getAllJobs):", err.message);
    }

    const job = await Job.findById(jobID).populate({
      path: "CompanyID",
      select: "logo companyName",
    });

    //INVALID JOB_ID OR NO JOB WITH SUC JOB_ID
    if (!job) {
      return res.status(400).json({
        MESSAGE: "Job not found",
        SUCCESS: false,
      });
    }

    return res.status(200).json({
      MESSAGE: `Jobs found successfully`,
      job,
      SUCCESS: true,
    });
  } catch (error) {
    console.log("Error while fetching job info");
    res.status(500).json({ MESSAGE: "Internal server error", SUCCESS: false });
  }
};

//API FOR FETCHING JOBS POSTED BY AUTHENTICATED ADMIN || RECRUITER
export const getPostedJobByAdmin = async (req, res) => {
  try {
    const userID = req.id; //MIDDLEWARE

    const cacheKey = `jobs:info:admin:posted:${userID}`;
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          MESSAGE: `Jobs found ${JSON.parse(cachedData).length}`,
          postedJobs: JSON.parse(cachedData),
          SUCCESS: true,
        });
      }
    } catch (err) {
      console.error("Redis get error (getAllJobs):", err.message);
    }

    const postedJobs = await Job.find({
      createdBy: userID,
    }).populate("CompanyID");

    if (!postedJobs) {
      return res.status(400).json({
        MESSAGE: "No jobs were posted by this user",
        SUCCESS: false,
      });
    }
    try {
      await redis.set(cacheKey, JSON.stringify(postedJobs), "EX", 300);
    } catch (err) {
      console.error("Redis set error (getPostedJobByAdmin):", err.message);
    }
    return res.status(200).json({
      MESSAGE: `Jobs found ${postedJobs.length}`,
      postedJobs,
      SUCCESS: true,
    });
  } catch (error) {
    console.log("Error while fetching job info");
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//DELETE Job BY ID
export const deleteJobByID = async (req, res) => {
  try {
    const jobID = req.params.jobID;
    if (!jobID || !validateObjectID(jobID)) {
      return res.status(400).json({
        MESSAGE: "No jobID ID provided",
        SUCCESS: false,
      });
    }

    //FIND AND DELETE
    const job = await Job.findByIdAndDelete(jobID);

    //HANDLING IF NO job WITH SUCH ID
    if (!job) {
      return res.status(400).json({
        MESSAGE: "Job not found",
        SUCCESS: false,
      });
    }

    await Application.deleteMany({ job: jobID });

    await clearCache([
      "jobs:all:*",
      "jobs:get:featured*",
      `job:info:*`,
      `jobs:info:admin:posted:*`,
      "user:savedJobs:*",
    ]);

    return res.status(200).json({
      MESSAGE: "Job Post and all related applications removed successfully",
      SUCCESS: true,
    });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
    console.log("Error while deleting company");
  }
};

//GET SAVED JOB
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.id;
    let cachedData = null;

    const cacheKey = `user:savedJobs:${userId}`;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (error) {
      console.log("Error fetching cache data", error?.message);
    }

    if (cachedData) {
      return res.status(200).json({
        MESSAGE: "JOBS FOUND",
        SUCCESS: true,
        savedJobs: JSON.parse(cachedData),
      });
    }

    const user = await User.findById(userId).populate({
      path: "savedJobs",
      populate: {
        path: "CompanyID",
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ MESSAGE: "User not found", SUCCESS: false });
    }

    try {
      await redis.set(cacheKey, JSON.stringify(user.savedJobs), "EX", 300);
    } catch (err) {
      console.error("Redis set error (getSavedJobs):", err.message);
    }

    res.status(200).json({
      MESSAGE: "JOBS FOUND",
      SUCCESS: true,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

export const getFeaturedJobs = async (req, res) => {
  try {
    const cachedKey = `jobs${req.path.replace(/\//g, ":")}`;
    let cachedData = null;
    //safeguard for redis errors
    try {
      cachedData = await redis.get(cachedKey);
    } catch (err) {
      console.error("Redis error (getFeaturedJobs):", err.message);
    }

    if (cachedData) {
      return res.status(200).json({
        MESSAGE: "JOBS FOUND",
        SUCCESS: true,
        featuredJobs: JSON.parse(cachedData),
      });
    }
    // Find all recruiters with an active subscription
    const activeSubscribers = await User.find(
      { "subscription.status": "active" }, // Find users with active subscription
      "_id" // Only fetch the recruiter IDs
    );

    // Extract recruiter IDs
    const recruiterIds = activeSubscribers.map((user) => user._id);

    // Fetch jobs posted by these recruiters
    const featuredJobs = await Job.find({ createdBy: { $in: recruiterIds } })
      .populate("CompanyID")
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10); //  Limit the number of featured jobs

    // Cache the result for future requests (e.g., cache for 10 minutes)
    try {
      await redis.set(cachedKey, JSON.stringify(featuredJobs), "EX", 600);
    } catch (err) {
      console.error("Redis error (getFeaturedJobs):", err.message);
    }

    res.status(200).json({
      MESSAGE: "JOBS FOUND",
      SUCCESS: true,
      featuredJobs,
    });
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};
