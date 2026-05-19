import mongoose from "mongoose";
import Application from "../models/application-model.js";

export const loadApplicationForRecruiter = async (applicationId, recruiterId) => {
  if (!mongoose.isValidObjectId(applicationId)) {
    return null;
  }

  const application = await Application.findById(applicationId)
    .populate({
      path: "job",
      select:
        "title description requirements experienceLevel salary location jobType createdBy",
    })
    .populate({
      path: "applicant",
      select: "username email profile",
    });

  if (!application?.job || !application?.applicant) {
    return null;
  }

  if (application.job.createdBy.toString() !== recruiterId.toString()) {
    return null;
  }

  return application;
};
