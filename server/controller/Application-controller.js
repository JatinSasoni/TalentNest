import Application from "../models/application-model.js";
import Job from "../models/job-model.js";
import User from "../models/user-model.js";
import { enqueueEmailSafely } from "../utils/enqueueEmailSafely.js";
import validateObjectID from "../utils/validateMongooseObjectID.js";

//STUDENT|| JobSEEKER APPLYING FOR JOB
export const applyForJob = async (req, res) => {
  try {
    //JOB AND APPLICANT
    const jobID = req.params.jobID;
    const userID = req.id;

    if (!jobID || !validateObjectID(jobID)) {
      return res.status(400).json({
        MESSAGE: "Something went wrong",
        SUCCESS: false,
      });
    }

    //CHECK IF ALREADY APPLIED FOR JOB
    const alreadyApplied = await Application.findOne({
      job: jobID,
      applicant: userID,
    });

    if (alreadyApplied) {
      const job = await Job.findById(jobID);
      if (job) {
        const appId = alreadyApplied._id.toString();
        const linked = job.application.some((id) => id.toString() === appId);
        if (!linked) {
          job.application.push(alreadyApplied._id);
          await job.save();
        }
      }
      return res.status(400).json({
        MESSAGE: "Already applied for this job",
        SUCCESS: false,
      });
    }

    //JOB EXISTS? IF EXISTS UPDATE ITS NO. OF APPLICATIONS
    const job = await Job.findById(jobID).populate("createdBy");

    if (!job) {
      return res.status(400).json({
        MESSAGE: "NO SUCH JOB",
        SUCCESS: false,
      });
    }

    //JOB EXISTS - CREATE NEW APPLICATION
    const newApplication = await Application.create({
      job: jobID,
      applicant: userID,
    });

    //GETTING USER DETAILS THROUGH USER ID TO MAIL
    const userData = await User.findById(userID);
    //userData.profile.resume

    //MAILING RECRUITER ABOUT NEW APPLICANT
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
      to: job?.createdBy?.email, // Sending to the recruiter's email
      subject: `New Applicant for Your Job Post: ${job?.title}`,
      html: `
        <p>Dear ${job?.createdBy?.username},</p>
        <p>We are excited to inform you that a new applicant has applied for your job posting on <strong>Job Portal</strong>.</p>
        
        <h3>Applicant Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${userData?.username}</li>
          <li><strong>Email:</strong> ${userData?.email}</li>
          <li><strong>Applied At:</strong> ${
            newApplication?.createdAt
              ? new Date(newApplication.createdAt).toLocaleDateString()
              : "N/A"
          }</li>
          <li><strong>Resume:</strong> ${
            userData?.profile?.resume
              ? `<a href="${userData.profile.resume}" download target="_blank" style="text-decoration: none;">
          <button style="background-color: #007bff; color: white; border: none; padding: 3px 12px; border-radius: 5px; cursor: pointer;">
            Download Resume
          </button>
        </a>`
              : "NA"
          }</li>

        </ul>
    
        <h3>${process.env.COMPANY_NAME}</h3>
        <ul>
          <li><strong>Job Title:</strong> ${job?.title}</li>
          <li><strong>Reference Number:</strong> ${
            newApplication?.job?._id
          }</li>
        </ul>
    
        <p>You can review the applicant's profile and take the next steps at your earliest convenience.</p>
        
        <p>For any assistance, feel free to reach out to us at <a href="mailto:${
          process.env.COMPANY_EMAIL
        }">${process.env.COMPANY_EMAIL}</a>.</p>
    
        <p>Best regards,</p>
        <p><strong>${process.env.COMPANY_NAME}</strong><br>
        Contact: <a href="mailto:${process.env.COMPANY_EMAIL}">${
        process.env.COMPANY_EMAIL
      }</a></p>
      `,
    };

    //UPDATE JOB COLLECTION (before email so Redis outage cannot orphan applications)
    job.application.push(newApplication._id);
    await job.save();

    await enqueueEmailSafely("newJobApplication", { mailOptions });

    return res.status(200).json({
      MESSAGE: "Applied for job successfully",
      SUCCESS: true,
    });
  } catch (error) {
    console.error("Error while applying for job:", error?.message);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//API FOR FETCHING JOBS APPLIED BY THE USER
export const getAppliedJobsByUser = async (req, res) => {
  try {
    const userID = req.id;

    const appliedJobs = await Application.find({
      applicant: userID,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "CompanyID",
          options: { sort: { createdAt: -1 } },
        },
      });

    if (!appliedJobs) {
      return res.status(400).json({
        MESSAGE: "Applications not found",
        SUCCESS: false,
      });
    }

    return res.status(200).json({
      MESSAGE: `Applied jobs ${appliedJobs.length}`,
      appliedJobs,
      SUCCESS: true,
    });
  } catch (error) {
    console.log("Error while fetching applied jobs");
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//UPDATING JOB / APPLICATION STATUS BY ADMIN || RECRUITER
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationID = req.params.applicationID;

    if (!status) {
      return res.status(400).json({
        MESSAGE: "Status is required",
        SUCCESS: false,
      });
    }

    if (!applicationID || !validateObjectID(applicationID)) {
      return res.status(400).json({
        MESSAGE: "Something went wrong",
        SUCCESS: false,
      });
    }

    // FIND APPLICATION BY APPLICATION ID
    const application = await Application.findOne({ _id: applicationID })
      .populate("applicant")
      .populate("job");

    if (application.status !== "pending") {
      return res.status(400).json({
        MESSAGE: "Application status cannot be changed again",
        SUCCESS: false,
      });
    }

    if (!application) {
      return res.status(400).json({
        MESSAGE: "Application not found",
        SUCCESS: false,
      });
    }

    // UPDATE STATUS
    application.status = status.toLowerCase();
    await application.save();

    // Email content based on status
    let mailOptions;
    if (application.status === "accepted") {
      mailOptions = {
        from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
        to: application?.applicant?.email,
        subject: "Your Job Request Has Been Accepted!",
        html: `
        <p>Dear ${application.applicant.username},</p>
        <p>We are pleased to inform you that your job request for <strong>${
          application.job.title
        }</strong> has been successfully accepted. Our team is now preparing to proceed with your request.</p>
        <h3>Job Details:</h3>
        <ul>
          <li><strong>Job Title:</strong> ${application.job.title}</li>
          <li><strong>Reference Number:</strong> ${application.job._id}</li>
          <li><strong>Applied at:</strong> ${
            application?.createdAt
              ? new Date(application.createdAt).toLocaleDateString()
              : "N/A"
          }</li>
        </ul>
        <p>If you have any questions or need further assistance, feel free to reach out to us at <a href="mailto:${
          process.env.COMPANY_EMAIL
        }">${process.env.COMPANY_EMAIL}</a>.</p>
        <p>Thank you for choosing <strong>${
          process.env.COMPANY_NAME
        }</strong>. We look forward to serving you!</p>
        <p>Best regards,</p>
        <p><strong>${process.env.COMPANY_NAME}</strong><br>
        Contact: <a href="mailto:${process.env.COMPANY_EMAIL}">${
          process.env.COMPANY_EMAIL
        }</a></p>
      `,
      };
    } else if (application.status === "rejected") {
      mailOptions = {
        from: `"${process.env.COMPANY_NAME}" <${process.env.COMPANY_EMAIL}>`,
        to: application?.applicant?.email,
        subject: "Your Job Application Status Update",
        html: `
        <p>Dear ${application.applicant.username},</p>
        <p>We regret to inform you that your job application for <strong>${
          application.job.title
        }</strong> has not been accepted at this time.</p>
        <p>We appreciate the time and effort you put into your application. While this opportunity didn’t work out, we encourage you to apply for future openings that match your skills and experience.</p>
        <h3>Job Details:</h3>
        <ul>
          <li><strong>Job Title:</strong> ${application.job.title}</li>
          <li><strong>Reference Number:</strong> ${application.job._id}</li>
          <li><strong>Applied at:</strong> ${
            application?.createdAt
              ? new Date(application.createdAt).toLocaleDateString()
              : "N/A"
          }</li>
        </ul>
        <p>We wish you the best in your job search. If you have any questions, feel free to reach out to us at <a href="mailto:${
          process.env.COMPANY_EMAIL
        }">${process.env.COMPANY_EMAIL}</a>.</p>
        <p>Best regards,</p>
        <p><strong>${process.env.COMPANY_NAME}</strong><br>
        Contact: <a href="mailto:${process.env.COMPANY_EMAIL}">${
          process.env.COMPANY_EMAIL
        }</a></p>
      `,
      };
    }

    if (mailOptions) {
      await enqueueEmailSafely("applicationStatusUpdate", { mailOptions });
    }

    return res.status(200).json({
      MESSAGE: "Application Status Updated",
      SUCCESS: true,
    });
  } catch (error) {
    console.error("Error while updating status of application:", error);
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//API FOR FETCHING ALL JOB APPLICATIONS APPLIED TO JOBS POSTED BY RECRUITER
export const appliedApplicationsForJob = async (req, res) => {
  try {
    const userID = req.id;
    const jobID = req.params.jobID;

    if (!jobID || !validateObjectID(jobID)) {
      return res.status(400).json({
        MESSAGE: "Something went wrong",
        SUCCESS: false,
      });
    }

    const job = await Job.findById(jobID).populate({
      path: "application",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
      },
    });

    //NO JOB POSTED OR NO DATA IN COLLECTION
    if (!job) {
      return res.status(400).json({
        MESSAGE: "No job or applications found ",
        SUCCESS: false,
      });
    }

    return res.status(200).json({
      MESSAGE: "DONE",
      job,
      SUCCESS: true,
    });
  } catch (error) {
    console.log(error);
    console.log("Error while updating status of application");
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};

//GET TOP RECRUITERS
export const getTopRecruiters = async (req, res) => {
  try {
    const topRecruiters = await Application.aggregate([
      { $match: { status: "accepted" } }, //COMMENT COZ ONLY TWO COMPANY FOR NOW WHO ACCEPTED APPLICANTS :)
      { $group: { _id: "$job" } }, //$job is Ref to Job Collection
      {
        $lookup: {
          from: "jobs", // LOOKING AT JOBS COLLECTION
          localField: "_id", //AT THIS POINT OUR "$job" is "_id" look at $group
          foreignField: "_id",
          as: "jobInfo",
        },
      },
      { $unwind: "$jobInfo" }, //ARRAY TO OBJECT
      {
        $group: { _id: "$jobInfo.CompanyID", totalApplications: { $sum: 1 } }, //GROUP BASED ON COMPANY ID SO NO SAME COMPANY
        // "$jobInfo.CompanyID" is Ref to companies collection
      },
      {
        $lookup: {
          from: "companies", // LOOKING AT COMPANIES COLLECTION
          localField: "_id", //AT THIS POINT OUR "$jobInfo.CompanyID" is "_id" look at second $group  query
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      { $unwind: "$companyInfo" },
      { $sort: { totalApplications: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          companyId: "$_id",
          companyName: "$companyInfo.companyName",
          companyLogo: "$companyInfo.logo",
          companyLocation: "$companyInfo.location",
          companySince: "$companyInfo.createdAt",
          totalApplications: 1, // 1 means we want totalApplications to be sent to frontend
        },
      },
    ]);

    if (!topRecruiters) {
      return res.status(400).json({
        MESSAGE: "Failed to fetch top recruiters",
        SUCCESS: false,
      });
    }
    return res.status(200).json({
      MESSAGE: "Fetched",
      topRecruiters,
      SUCCESS: true,
    });
  } catch (error) {
    console.log("Error fetching top recruiters");
    res.status(500).json({ MESSAGE: "Server error", SUCCESS: false });
  }
};
