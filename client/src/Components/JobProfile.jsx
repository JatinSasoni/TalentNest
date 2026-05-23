import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { InterviewHistoryList } from "./interview/InterviewHistoryList";
import { handleApplyForJob, handleGetSingleJob } from "../../Api/getAPI";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { setSingleJobData } from "../../store/jobSlice";
import { setLoading } from "../../store/authSlice";
import { motion } from "framer-motion";

export const JobProfile = () => {
  const { jobID } = useParams();
  const { loggedInUser: user, loading } = useSelector((store) => store.auth);
  const [localLoading, setLocalLoading] = useState(false);
  const { singleJobData } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  // Check if the user has already applied for the job
  const initialState =
    singleJobData?.application?.some(
      (application) => application?.applicant === user?._id
    ) || false;
  const [alreadyApplied, setAlreadyApplied] = useState(initialState);

  // Apply for job
  const applyForJob = async () => {
    try {
      setLocalLoading(true);
      const response = await handleApplyForJob(jobID);
      if (response.data.SUCCESS) {
        toast.success(response.data.MESSAGE);
        setAlreadyApplied(true);
        const updateSingleData = {
          ...singleJobData,
          application: [...singleJobData.application, { applicant: user?._id }],
        };
        dispatch(setSingleJobData(updateSingleData));
      }
    } catch (error) {
      toast.error(error.response.data.MESSAGE);
    } finally {
      setLocalLoading(false);
    }
  };

  // Fetch single job data
  useEffect(() => {
    const fetchSingleJob = async (jobID) => {
      try {
        dispatch(setLoading(true));
        const response = await handleGetSingleJob(jobID);
        if (response.data.SUCCESS) {
          dispatch(setSingleJobData(response.data.job));
          setAlreadyApplied(
            response.data.job?.application?.some(
              (application) => application?.applicant === user?._id
            )
          );
        }
      } catch (error) {
        toast.error(error.response.data.MESSAGE);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchSingleJob(jobID);
  }, [jobID, dispatch, user?._id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-112px)]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl p-6 dark:text-white"
    >
      {/* Job Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col max-md:gap-4 md:flex-row justify-between items-center bg-gray-100 dark:bg-zinc-800 p-6 rounded-lg shadow-md"
      >
        {/* Company Logo & Name */}
        <div className="flex items-center gap-4">
          <img
            src={singleJobData?.CompanyID?.logo}
            alt="Company Logo"
            className="max-md:w-12 max-md:h-12 w-16 h-16 object-fill rounded-full shadow"
          />
          <h1 className="max-md:text-2xl text-3xl font-bold">
            {singleJobData?.CompanyID?.companyName}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {user?.role === "student" && (
            <Link
              to={`/description/${jobID}/interview`}
              className="px-6 max-md:py-2 py-3 rounded-lg text-white font-semibold text-center bg-purple-500 hover:bg-purple-600 transition"
            >
              Practice interview
            </Link>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 max-md:py-2 py-3 rounded-lg text-white font-semibold transition ${
              alreadyApplied
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            disabled={alreadyApplied}
            onClick={applyForJob}
          >
            {localLoading ? (
              <div className="animate-spin h-5 w-5 border-4 border-blue-100 border-t-transparent rounded-full mx-auto"></div>
            ) : alreadyApplied ? (
              "Already Applied"
            ) : (
              "Apply Now"
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Job Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid md:grid-cols-3 gap-4 mt-6"
      >
        <div className="p-4 bg-blue-50 dark:bg-zinc-800 rounded-lg shadow-md text-center">
          <span className="text-lg font-semibold text-blue-800 dark:text-blue-300">
            {singleJobData?.position}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300">Positions</p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-zinc-800 rounded-lg shadow-md text-center">
          <span className="text-lg font-semibold text-red-600 dark:text-red-400">
            {singleJobData?.jobType}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300">Job Type</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-zinc-800 rounded-lg shadow-md text-center">
          <span className="text-lg font-semibold text-purple-600">
            {singleJobData?.salary} LPA
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300">Salary</p>
        </div>
      </motion.div>

      {/* Job Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold border-b pb-3">
          Job Description
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Role:{" "}
            </span>
            {singleJobData?.title}
          </div>
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Location:{" "}
            </span>
            {singleJobData?.location}
          </div>
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Description:{" "}
            </span>
            {singleJobData?.description}
          </div>
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Experience:{" "}
            </span>
            {singleJobData?.experienceLevel} Years
          </div>
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Salary:{" "}
            </span>
            {singleJobData?.salary} LPA
          </div>
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Requirements:{" "}
            </span>
            {singleJobData?.requirements?.join(", ")}
          </div>
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Total Applicants:{" "}
            </span>
            {singleJobData?.application?.length}
          </div>
          <div>
            <span className="font-semibold text-lg text-blue-900 dark:text-zinc-400">
              Posted Date:{" "}
            </span>
            {singleJobData?.createdAt?.split("T")[0]}
          </div>
          <div>
            <span className="text-lg text-blue-900 dark:text-zinc-400">
              Company Website:{" "}
            </span>
            <a
              href={
                singleJobData?.CompanyID?.website?.startsWith("http")
                  ? singleJobData.CompanyID.website
                  : `https://${singleJobData?.CompanyID?.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline hover:text-blue-800 transition duration-300"
            >
              {singleJobData?.CompanyID?.website}
            </a>
          </div>
        </div>
      </motion.div>

      {user?.role === "student" && (
        <InterviewHistoryList jobId={jobID} />
      )}
    </motion.section>
  );
};
