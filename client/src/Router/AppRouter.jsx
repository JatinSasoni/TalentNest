import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../Layout/AppLayout";
import { ErrorPage } from "../Components/ErrorPage";
import { Home } from "../pages/Home";
import { Contact } from "../pages/Contact";
import { Jobs } from "../pages/Jobs";
import { SavedJobs } from "../Components/SavedJobs";
import { Profile } from "../Components/Profile";
import { JobProfile } from "../Components/JobProfile";
import { BrowsePage } from "../Components/BrowsePage";
import { AiResumeReviewPage } from "../pages/AiResumeReviewPage";
import { ResumeBuilderPage } from "../pages/ResumeBuilderPage";
import { JobInterviewPracticePage } from "../pages/JobInterviewPracticePage";
import { JobInterviewReportPage } from "../pages/JobInterviewReportPage";
import { ResetPassPage } from "../pages/ResetPassPage";
import { VerifyOTPPage } from "../pages/VerifyOTPPage";
import { ProtectedChangePassword } from "../pages/protect/ProtectChangePassword";
import { ChangePasswordPage } from "../pages/ChangePasswordPage";
import { Login } from "../pages/Login";
import RegisterPage from "../pages/RegisterPage";
import ProtectAdminRoute from "../Components/admin/ProtectAdminRoute";
import { AdminCompanies } from "../Components/admin/AdminCompanies";
import { RegisterNewCompany } from "../Components/admin/RegisterNewCompany";
import { UpdateCompany } from "../Components/admin/UpdateCompany";
import { AdminJobs } from "../Components/admin/AdminJobs";
import { RegisterNewJob } from "../Components/admin/RegisterNewJob";
import { AdminApplicants } from "../Components/admin/AdminApplicants";
import { ViewApplicant } from "../Components/admin/ViewApplicant";
import { UpdateJobPost } from "../Components/admin/UpdateJobPost";
import MakePayment from "../Razorpay/MakePayment";
import Success from "../Razorpay/Success";

//ROUTES
const AppRouter = createBrowserRouter([
  //SEEKER ROUTES
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },

      {
        path: "/jobs",
        element: <Jobs />,
      },
      {
        path: "/user/jobs/saved",
        element: <SavedJobs />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/description/:jobID",
        element: <JobProfile />,
      },
      {
        path: "/description/:jobID/interview",
        element: <JobInterviewPracticePage />,
      },
      {
        path: "/description/:jobID/interview/report/:sessionId",
        element: <JobInterviewReportPage />,
      },
      {
        path: "/browse",
        element: <BrowsePage />,
      },
      {
        path: "/resume-review",
        element: <AiResumeReviewPage />,
      },
      {
        path: "/resume-builder",
        element: <ResumeBuilderPage />,
      },

      {
        path: "/user/change/:userID/password",
        element: (
          <ProtectedChangePassword>
            <ChangePasswordPage />
          </ProtectedChangePassword>
        ),
      },
    ],
  },

  //LOGIN-SIGNUP ROUTES
  {
    errorElement: <ErrorPage />,
    path: "/login",
    element: <Login />,
  },
  //SIGN-UP
  {
    errorElement: <ErrorPage />,
    path: "/signup",
    element: <RegisterPage />,
  },
  //CONTACT
  {
    path: "/contact",
    errorElement: <ErrorPage />,
    element: <Contact />,
  },

  //RESET PASSWORD
  {
    path: "/user/reset-pass",
    element: <ResetPassPage />,
  },
  //VERIFY PASSWORD
  {
    path: "/user/:userID/verify-otp",
    element: <VerifyOTPPage />,
  },

  //ADMIN/RECRUITER ROUTES
  {
    path: "/admin",
    errorElement: <ErrorPage />,
    children: [
      {
        path: "companies", // -> /companies throw error because it will try to find /companies (absolute path)
        element: (
          <ProtectAdminRoute>
            <AdminCompanies />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "register",
        element: (
          <ProtectAdminRoute>
            <RegisterNewCompany />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "company/update/:companyID",
        element: (
          <ProtectAdminRoute>
            <UpdateCompany />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "jobs",
        element: (
          <ProtectAdminRoute>
            <AdminJobs />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "job/create",
        element: (
          <ProtectAdminRoute>
            <RegisterNewJob />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "job/:jobID/applicants",
        element: (
          <ProtectAdminRoute>
            <AdminApplicants />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "applicant/:applicantID/profile",
        errorElement: <ErrorPage />,
        element: (
          <ProtectAdminRoute>
            <ViewApplicant />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "job-post/:jobID/edit",
        element: (
          <ProtectAdminRoute>
            <UpdateJobPost />
          </ProtectAdminRoute>
        ),
      },

      {
        path: "subscribe",
        element: (
          <ProtectAdminRoute>
            <MakePayment />
          </ProtectAdminRoute>
        ),
      },
      {
        path: "payment-success",
        element: (
          <ProtectAdminRoute>
            <Success />
          </ProtectAdminRoute>
        ),
      },
    ],
  },

  //HANDLING FALSE ROUTE
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default AppRouter;
