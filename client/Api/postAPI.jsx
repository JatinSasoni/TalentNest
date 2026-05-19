import axios from "axios";

//AXIOS INSTANCEs
const api = axios.create({
  baseURL: window._env_.VITE_API_URI,
});

//LOGIN POST API
export const handleLoginAPICall = (data) => {
  return api.post("/api/v1/user/login", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

//SIGNUP POST API
export const handleSignupAPICall = (data) => {
  return api.post("/api/v1/user/register", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

//UPDATE PROFILE API
export const handleUpdateAPICall = (data) => {
  return api.post("/api/v1/user/profile/update", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//ADMIN API
export const handleRegisterComAPI = (data) => {
  return api.post("/api/v1/company/register", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

//UPDATE COMPANY
export const handleUpdateComAPI = (data, companyID) => {
  return api.put(`/api/v1/company/update/${companyID}`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const generateJobDescriptionAPI = (data) => {
  return api.post("/api/v1/ai/job-description/generate", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const generateApplicantSummaryAPI = (data) => {
  return api.post("/api/v1/ai/applicant/summary", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const reviewStudentResumeAPI = (data = {}) => {
  return api.post("/api/v1/ai/resume/review", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const handlePostJobAPI = (data) => {
  return api.post("/api/v1/job/post", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};
export const handleEditJobAPI = (jobID, data) => {
  return api.post(`/api/v1/job/job-post/${jobID}/edit`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

export const handleStatusUpdateAPI = (status, applicationID) => {
  return api.post(
    `/api/v1/application/status/${applicationID}/update`,
    status,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "Application/json",
      },
    }
  );
};

export const generateOTPForPassAPI = (data) => {
  return api.post(`/api/v1/user/reset-password`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

export const verifyOTPForPassAPI = (data) => {
  return api.post(`/api/v1/user/verify-otp`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

export const changePasswordAPI = (data) => {
  return api.post(`/api/v1/user/change-password`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

//CONTACT FORM API
export const contactFormAPI = (data) => {
  return api.post(`/api/v1/contact/reach-out`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "Application/json",
    },
  });
};

//SAVE/UNSAVE JOB POST
export const saveUnsavePostAPI = (jobId) => {
  return api.post(
    `/api/v1/user/save-job`,
    { jobId },
    {
      withCredentials: true,
    }
  );
};
