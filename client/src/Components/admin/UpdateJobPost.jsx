import { PostJobForm } from "./admin components/PostJobForm";
import { useEffect, useState } from "react";
import { handleGetJobInfoAPI } from "../../../Api/getAPI";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../Shared/Navbar";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/authSlice";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../util/getApiErrorMessage";
import { handleEditJobAPI } from "../../../Api/postAPI";
import { motion } from "motion/react";

export const UpdateJobPost = () => {
  const { jobID } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [singleJobInfo, setSingleJobInfo] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const getSingleJobPost = async (jobID) => {
      try {
        const response = await handleGetJobInfoAPI(jobID);
        if (response.data.SUCCESS) {
          setSingleJobInfo(response.data.job);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load job"));
      } finally {
        setLocalLoading(false);
      }
    };

    getSingleJobPost(jobID);
  }, [jobID]);

  const onSubmit = async (data) => {
    try {
      dispatch(setLoading(true));
      const response = await handleEditJobAPI(jobID, data);

      if (response.data.SUCCESS) {
        toast.success(response.data.MESSAGE);
        navigate("/admin/jobs");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update job"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (localLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-120px)]">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  return (
    <section>
      <Navbar />
      <div className="mx-auto max-w-7xl md:flex md:gap-14 p-2 ">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "tween", duration: 1 }}
          className="hidden md:flex flex-col items-center gap-14 p-4 pt-10 "
        >
          <div>
            <p className="text-5xl font-semibold  text-zinc-700 text-center dark:text-white">
              Modify<span className="text-blue-400 font-bold"> Job-Post</span>
            </p>
            <p className="text-md text-gray-600 dark:text-gray-300 mt-2 text-center">
              Update job details and keep opportunities fresh.
            </p>
          </div>
          <div className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <img
              src={singleJobInfo?.CompanyID?.logo}
              className="md:size-80 lg:size-96 rounded-full"
              alt="CompanyLogo"
              loading="lazy"
            />
          </div>
        </motion.div>
        <p className="text-3xl md:hidden font-semibold  text-zinc-700 text-center dark:text-white">
          Modify<span className="text-blue-400 font-bold"> Job-Post</span>
        </p>
        <PostJobForm singleJobInfo={singleJobInfo} onSubmit={onSubmit} />
      </div>
    </section>
  );
};
