/* eslint-disable react/prop-types */
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineMarkEmailRead, MdNumbers } from "react-icons/md";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { FaRegFilePdf } from "react-icons/fa";
export const ProfileInfo = ({ setIsUpdateProfile }) => {
  const { loggedInUser } = useSelector((state) => state.auth);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "tween" }}
      className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 dark:text-white shadow-lg rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="relative bg-blue-500 text-white p-6 dark:bg-zinc-800">
        <div className="absolute top-4 right-4">
          <button
            className="bg-white text-blue-500 px-3 py-1 rounded-md text-sm font-medium shadow hover:bg-gray-100"
            onClick={() => setIsUpdateProfile(true)}
          >
            <FaRegEdit className="inline-block mr-1" /> Edit Profile
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
            <img
              src={loggedInUser?.profile?.profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{loggedInUser?.username}</h1>
            <p className="text-lg opacity-80">{loggedInUser?.role}</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Bio */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            About Me
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {loggedInUser?.profile?.bio || "No bio available"}
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Contact Information
          </h3>
          <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-300">
            <MdOutlineMarkEmailRead className="text-blue-500 text-xl" />
            <span>{loggedInUser?.email}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-300">
            <MdNumbers className="text-blue-500 text-xl" />
            <span>{loggedInUser?.phoneNumber || "Not provided"}</span>
          </div>
        </div>

        {/* Skills */}
        {loggedInUser?.role === "student" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Skills
            </h3>
            {loggedInUser?.profile?.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {loggedInUser.profile.skills.map((skill, ind) => (
                  <span
                    key={ind}
                    className="bg-blue-500 text-white text-xs font-medium py-1 px-3 rounded-full shadow-sm dark:bg-zinc-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-2">No skills added</p>
            )}
          </div>
        )}

        {/* Resume */}
        {loggedInUser?.role === "student" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Resume
            </h3>
            {loggedInUser?.profile?.resume ? (
              <a
                href={loggedInUser.profile.resume}
                className="text-blue-400 font-medium hover:scale-105 duration-300 mt-2 inline-block "
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex gap-1">
                  <FaRegFilePdf className="my-auto" />
                  {loggedInUser.profile.resumeOriginalName}
                </span>
              </a>
            ) : (
              <p className="text-red-500 mt-2">* Please upload your resume</p>
            )}
          </div>
        )}

      </div>
    </motion.section>
  );
};
