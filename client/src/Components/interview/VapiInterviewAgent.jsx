/* eslint-disable react/prop-types */
import Vapi from "@vapi-ai/web";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { buildInterviewerAssistant } from "../../constants/vapiInterviewer";
import { submitInterviewFeedbackAPI } from "../../../Api/postAPI";
import { getApiErrorMessage } from "../../../util/getApiErrorMessage";
import { ButtonSpinner } from "../admin/admin components/ButtonSpinner";

const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};

const getVapiKey = () =>
  window._env_?.VITE_VAPI_PUBLIC_API_KEY ||
  import.meta.env.VITE_VAPI_PUBLIC_API_KEY;

export const VapiInterviewAgent = ({
  sessionId,
  jobId,
  jobTitle,
  companyName,
  questions,
  username,
}) => {
  const navigate = useNavigate();
  const vapiRef = useRef(null);
  const feedbackStartedRef = useRef(false);

  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const key = getVapiKey();
    if (!key) return;

    const vapi = new Vapi(key);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setCallStatus(CallStatus.ACTIVE));
    vapi.on("call-end", () => setCallStatus(CallStatus.FINISHED));
    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript },
        ]);
      }
    });
    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));
    vapi.on("error", (error) => {
      console.error("Vapi error:", error);
      toast.error("Call error. Please try again.");
      setCallStatus(CallStatus.FINISHED);
      vapi.stop();
    });

    return () => {
      vapi.stop();
      vapiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  useEffect(() => {
    if (callStatus !== CallStatus.FINISHED || feedbackStartedRef.current) {
      return;
    }

    if (messages.length === 0) {
      toast.info("No conversation recorded. Try the interview again.");
      return;
    }

    const runFeedback = async () => {
      feedbackStartedRef.current = true;
      setSubmittingFeedback(true);
      try {
        const response = await submitInterviewFeedbackAPI(sessionId, messages);
        if (response.data.SUCCESS) {
          toast.success("Generating your feedback report...");
          navigate(`/description/${jobId}/interview/report/${sessionId}`);
        }
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not save interview feedback")
        );
        feedbackStartedRef.current = false;
      } finally {
        setSubmittingFeedback(false);
      }
    };

    runFeedback();
  }, [callStatus, messages, sessionId, jobId, navigate]);

  const handleStartCall = async () => {
    const key = getVapiKey();
    if (!key) {
      toast.error("Voice interview is not configured (missing Vapi key).");
      return;
    }

    const vapi = vapiRef.current;
    if (!vapi) return;

    try {
      setCallStatus(CallStatus.CONNECTING);
      setMessages([]);
      feedbackStartedRef.current = false;

      const formattedQuestions = (questions || [])
        .map((q) => `- ${q}`)
        .join("\n");

      const assistant = buildInterviewerAssistant({ jobTitle, companyName });

      await vapi.start(assistant, {
        variableValues: {
          questions: formattedQuestions,
          jobTitle,
          companyName,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Could not start the call. Check microphone permissions.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleEndCall = () => {
    vapiRef.current?.stop();
    setCallStatus(CallStatus.FINISHED);
  };

  const vapiConfigured = Boolean(getVapiKey());

  return (
    <section className="mt-6">
      {!vapiConfigured && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
          Vapi is not configured. Add VITE_VAPI_PUBLIC_API_KEY to client env and
          restart the dev server.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[220px]">
          <div
            className={`w-20 h-20 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl font-bold ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          >
            AI
          </div>
          <p className="mt-3 font-medium text-gray-700 dark:text-gray-200">
            Interviewer
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {username?.slice(0, 1)?.toUpperCase() || "Y"}
          </div>
          <p className="mt-3 font-medium text-gray-700 dark:text-gray-200">
            {username || "You"}
          </p>
        </div>
      </div>

      {lastMessage && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-gray-300 text-center">
          {lastMessage}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {submittingFeedback ? (
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <ButtonSpinner />
            Saving feedback...
          </div>
        ) : callStatus === CallStatus.ACTIVE ? (
          <button
            type="button"
            onClick={handleEndCall}
            className="px-8 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
          >
            End interview
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartCall}
            disabled={
              !vapiConfigured ||
              callStatus === CallStatus.CONNECTING ||
              !questions?.length
            }
            className="px-8 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50"
          >
            {callStatus === CallStatus.CONNECTING
              ? "Connecting..."
              : callStatus === CallStatus.FINISHED
                ? "Call ended"
                : "Start interview"}
          </button>
        )}
      </div>

      <p className="text-xs text-center text-gray-400 mt-3">
        Use headphones and allow microphone access in your browser.
      </p>
    </section>
  );
};
