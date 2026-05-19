import { shallowEqual, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { AiJobSuggestionPanel } from "./AiJobSuggestionPanel";

/* eslint-disable react/prop-types */
export const PostJobForm = ({ onSubmit, singleJobInfo = "", showAiPanel = true }) => {
  const { allCompanies } = useSelector((store) => store.company, shallowEqual);
  const { isDarkMode, loading } = useSelector(
    (store) => store.auth,
    shallowEqual
  );
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    // formState: { errors },
  } = useForm();

  const watchedFields = watch();

  const selectedCompanyName = useMemo(() => {
    const company = allCompanies?.find(
      (c) => c._id === watchedFields.CompanyID
    );
    return company?.companyName || "";
  }, [allCompanies, watchedFields.CompanyID]);

  const aiFormValues = {
    title: watchedFields.title || "",
    location: watchedFields.location || "",
    jobType: watchedFields.jobType || "",
    experienceLevel: watchedFields.experienceLevel ?? "",
    salary: watchedFields.salary ?? "",
    companyName: selectedCompanyName,
  };

  const handleApplyAiSuggestion = ({ description, requirements }) => {
    setValue("description", description, { shouldDirty: true });
    setValue("requirements", requirements, { shouldDirty: true });
  };

  // **Update the form values when `singleJobInfo` changes**
  useEffect(() => {
    if (singleJobInfo) {
      reset({
        title: singleJobInfo?.title || "",
        description: singleJobInfo?.description || "",
        requirements: singleJobInfo?.requirements.toString() || "",
        salary: singleJobInfo?.salary || "",
        jobType: singleJobInfo?.jobType || "",
        position: singleJobInfo?.position || "",
        experienceLevel: singleJobInfo?.experienceLevel || 0,
        location: singleJobInfo?.location || "",
        CompanyID: singleJobInfo?.CompanyID?._id || "", //CompanyID._id because we populated CompanyID with some data
      });
    }
  }, [singleJobInfo, reset]); // Run when `singleJobInfo` updates

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <motion.form
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "tween", duration: 1 }}
      className="max-w-7xl mx-auto dark:bg-zinc-900 rounded-lg max-md:mx-2"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
    >
      <motion.div
        className={
          showAiPanel
            ? "grid lg:grid-cols-[minmax(380px,42%)_1fr] gap-8 items-start"
            : ""
        }
      >
        {showAiPanel && (
          <AiJobSuggestionPanel
            formValues={aiFormValues}
            onApplySuggestion={handleApplyAiSuggestion}
            disabled={loading}
          />
        )}

        <motion.div>
      {/* Title Field */}
      <div className="mb-2">
        <label className="block text-gray-700 dark:text-gray-300 mb-1 ">
          Title
        </label>
        <input
          type="text"
          {...register("title")}
          className="w-full px-4 py-2  border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Description Field */}
      <div className="mb-2">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Requirements Field */}
      <div className="mb-2">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">
          Requirements
        </label>
        <textarea
          {...register("requirements")}
          className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Salary & Location */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Salary (LPA)
          </label>
          <input
            type="number"
            {...register("salary")}
            className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            {...register("location")}
            className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Job Type & Experience Level */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Job Type
          </label>
          <input
            type="text"
            {...register("jobType")}
            className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Experience Level
          </label>
          <input
            type="number"
            {...register("experienceLevel")}
            className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Position & Company Selection */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Positions
          </label>
          <input
            type="number"
            {...register("position")}
            className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Company
          </label>
          {allCompanies?.length > 0 ? (
            <select
              {...register("CompanyID")}
              defaultValue=""
              className="w-full px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:bg-zinc-900 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>
                Select a company
              </option>
              {allCompanies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-red-500 mt-1">
              *Please register a company first
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="w-full mt-5 bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          {loading ? (
            <>
              <div className="flex gap-2 justify-center">
                <div className="loader"></div>
                {/* <span className="animate-bounce">wait</span> */}
              </div>
            </>
          ) : (
            "Post"
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full mt-5 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Go Back
        </button>
      </div>
        </motion.div>
      </motion.div>
    </motion.form>
  );
};
