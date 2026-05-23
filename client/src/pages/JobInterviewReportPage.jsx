import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { getInterviewSessionAPI } from "../../Api/getAPI";
import { InterviewHistoryList } from "../Components/interview/InterviewHistoryList";
import { getApiErrorMessage } from "../../util/getApiErrorMessage";
import { toast } from "react-toastify";

export const JobInterviewReportPage = () => {
  const { jobID, sessionId } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useSelector((state) => state.auth, shallowEqual);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await getInterviewSessionAPI(sessionId);
        if (response.data.SUCCESS) {
          setSession(response.data.data);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not load report"));
        navigate(`/description/${jobID}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, jobID, loggedInUser, navigate]);

  const feedback = session?.feedback;

  const categories = feedback
    ? [
        { title: "Communication", ...feedback.communicationSkills },
        { title: "Technical knowledge", ...feedback.technicalKnowledge },
        { title: "Problem solving", ...feedback.problemSolving },
        { title: "Role fit", ...feedback.culturalRoleFit },
        { title: "Confidence & clarity", ...feedback.confidenceClarity },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-16 dark:text-white">
      <Link
        to={`/description/${jobID}`}
        className="text-sm text-blue-400 hover:underline"
      >
        ← Back to job
      </Link>

      <h1 className="text-2xl font-bold mt-4 text-gray-700 dark:text-white">
        Interview feedback
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {session?.jobTitle} · {session?.companyName}
      </p>

      <div className="mt-6 p-6 rounded-lg bg-white dark:bg-zinc-900 shadow-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Overall score</p>
        <p className="text-5xl font-bold text-blue-400 mt-1">
          {session?.totalScore ?? "—"}/10
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Average of the five category scores below
        </p>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-lg border border-gray-100 dark:border-zinc-800"
          >
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">
              {cat.title}
            </h3>
            <p className="text-green-600 dark:text-green-400 font-medium mt-1">
              {cat.score}/10
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {cat.feedback}
            </p>
          </div>
        ))}
      </div>

      {feedback?.areasOfImprovement?.length > 0 && (
        <div className="mt-6 p-5 rounded-lg bg-white dark:bg-zinc-900 shadow-lg">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Areas to improve
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
            {feedback.areasOfImprovement.map((area, idx) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      <InterviewHistoryList jobId={jobID} />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to={`/description/${jobID}/interview`}
          className="px-5 py-2.5 rounded-lg bg-blue-400 text-white text-sm hover:bg-blue-500"
        >
          Practice again
        </Link>
        <Link
          to={`/description/${jobID}`}
          className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-600 text-sm text-gray-600 dark:text-gray-300"
        >
          View job
        </Link>
      </div>
    </div>
  );
};
