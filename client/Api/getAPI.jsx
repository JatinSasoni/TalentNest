import axios from "axios";
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NUMBER } from "../util/Constants";

//AXIOS INSTANCE
const api = axios.create({
  baseURL: window._env_.VITE_API_URI,
});

//LOGOUT GET API
export const handleLogoutAPICall = () => {
  return api.get("/api/v1/user/logout", {
    withCredentials: true,
  });
};

//GET ALL JOBS API
export const handleGetAllJobs = (
  keyword = "", //DEFAULT
  page = DEFAULT_PAGE_NUMBER, //DEFAULT
  limit = DEFAULT_PAGE_LIMIT //DEFAULT
) => {
  return api.get(
    `/api/v1/job/get?keyword=${keyword}&page=${page}&limit=${limit}`,
    {
      withCredentials: true,
    }
  );
};

//GET FEATURED

export const handleGetFeaturedJobs = () => {
  return api.get(`/api/v1/job/get/featured`, {
    withCredentials: true,
  });
};

//GET SINGLE JOB BY JOB ID
export const handleGetSingleJob = (JobID) => {
  return api.get(`/api/v1/job/get/${JobID}`, {
    withCredentials: true,
  });
};

//APPLY FOR JOB POST API
export const handleApplyForJob = (JobID) => {
  return api.get(`/api/v1/application/apply/${JobID}`, {
    withCredentials: true,
  });
};

export const handleGetAllAppliedJobs = () => {
  return api.get(`/api/v1/application/get`, {
    withCredentials: true,
  });
};

//ADMIN
export const handleGetSingleCompanyDes = (companyID) => {
  return api.get(`/api/v1/company/get/${companyID}`, {
    withCredentials: true,
  });
};

export const handleGetAllCompanyDes = () => {
  return api.get(`/api/v1/company/get`, {
    withCredentials: true,
  });
};

export const handleGetAllAdminJobs = () => {
  return api.get(`/api/v1/job/getadminjobs`, {
    withCredentials: true,
  });
};

export const handleGetAllApplicantsAPI = (jobID) => {
  return api.get(`api/v1/application/${jobID}/applicants`, {
    withCredentials: true,
  });
};

export const handleGetAllContactsAPI = () => {
  return api.get(`api/v1/contact/get/contacts`, {
    withCredentials: true,
  });
};

export const handleGetSavedJobsAPI = () => {
  return api.get(`api/v1/job/saved`, {
    withCredentials: true,
  });
};

export const handleGetApplicantProfile = (applicantID) => {
  return api.get(`/api/v1/user/${applicantID}`, {
    withCredentials: true,
  });
};

export const handleGetJobInfoAPI = (jobID) => {
  return api.get(`/api/v1/job/admin/${jobID}/get`, {
    withCredentials: true,
  });
};

export const handleGetTopRecruiters = () => {
  return api.get(`/api/v1/application/get/top-recruiters`, {
    withCredentials: true,
  });
};

export const getInterviewSessionAPI = (sessionId) => {
  return api.get(`/api/v1/ai/interview/session/${sessionId}`, {
    withCredentials: true,
  });
};

export const getJobInterviewHistoryAPI = (jobId) => {
  return api.get(`/api/v1/ai/interview/job/${jobId}/history`, {
    withCredentials: true,
  });
};
