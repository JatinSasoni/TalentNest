import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { VapiInterviewAgent } from "../Components/interview/VapiInterviewAgent";
import { startJobInterviewAPI } from "../../Api/postAPI";
import { getApiErrorMessage } from "../../util/getApiErrorMessage";

export const JobInterviewPracticePage = () => {
  const { jobID } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useSelector((state) => state.auth, shallowEqual);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const initStartedForJobRef = useRef(null);

  const userId = loggedInUser?._id;
  const userRole = loggedInUser?.role;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (userRole === "recruiter") {
      navigate("/admin/jobs");
      return;
    }
    if (userRole !== "student") {
      return;
    }

    if (initStartedForJobRef.current === jobID) {
      return;
    }
    initStartedForJobRef.current = jobID;

    let cancelled = false;

    const initSession = async () => {
      try {
        setLoading(true);
        const response = await startJobInterviewAPI(jobID);
        if (cancelled) return;

        if (response.data.SUCCESS) {
          setSession(response.data.data);
        } else {
          toast.error(
            response.data.MESSAGE || "Could not start interview practice"
          );
          navigate(`/description/${jobID}`);
        }
      } catch (error) {
        if (cancelled) return;
        toast.error(
          getApiErrorMessage(error, "Could not start interview practice")
        );
        navigate(`/description/${jobID}`);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, [jobID, userId, userRole, navigate]);

  if (!loggedInUser || loggedInUser.role !== "student") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-16 dark:text-white">
      <Link
        to={`/description/${jobID}`}
        className="text-sm text-blue-400 hover:underline"
      >
        ← Back to job
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold mt-4 text-gray-700 dark:text-white">
        Interview <span className="text-blue-400">Practice</span>
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {session.jobTitle} at {session.companyName}
      </p>

      <div className="mt-4 p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-lg">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Questions you may hear
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {session.questions?.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      <VapiInterviewAgent
        sessionId={session.sessionId}
        jobId={jobID}
        jobTitle={session.jobTitle}
        companyName={session.companyName}
        questions={session.questions}
        username={loggedInUser.username}
      />
    </div>
  );
};
