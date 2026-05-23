/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobInterviewHistoryAPI } from "../../../Api/getAPI";

export const InterviewHistoryList = ({ jobId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getJobInterviewHistoryAPI(jobId);
        if (response.data.SUCCESS) {
          setSessions(response.data.sessions || []);
        }
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [jobId]);

  if (loading) {
    return (
      <p className="text-sm text-gray-400 mt-4">Loading practice history...</p>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold border-b pb-3 dark:border-zinc-700">
        Your practice history
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
        Past mock interviews for this job. Overall score is the average of all
        category scores.
      </p>
      <ul className="space-y-2">
        {sessions.map((item) => (
          <li
            key={item.sessionId}
            className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700"
          >
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Score:{" "}
                <span className="text-blue-400">
                  {item.totalScore != null ? `${item.totalScore}/10` : "—"}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(item.createdAt)}
              </p>
            </div>
            <Link
              to={`/description/${jobId}/interview/report/${item.sessionId}`}
              className="text-sm text-blue-400 hover:underline font-medium"
            >
              View report
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
