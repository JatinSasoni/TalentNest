import { shallowEqual, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const RECRUITER_SUBSCRIBE_PATH = "/admin/subscribe";

export const useRecruiterAiAccess = () => {
  const navigate = useNavigate();
  const { loggedInUser } = useSelector((store) => store.auth, shallowEqual);

  const isSubscribed = loggedInUser?.subscription?.status === "active";

  const redirectToSubscribe = (message) => {
    toast.info(message || "Subscribe to unlock AI features");
    navigate(RECRUITER_SUBSCRIBE_PATH);
  };

  const guardAiAction = (onAllowed) => {
    if (!isSubscribed) {
      redirectToSubscribe();
      return false;
    }

    if (typeof onAllowed === "function") {
      onAllowed();
    }

    return true;
  };

  const handleAiApiError = (error) => {
    if (error?.response?.data?.requiresSubscription) {
      redirectToSubscribe(error.response.data.MESSAGE);
      return true;
    }
    return false;
  };

  return {
    isSubscribed,
    guardAiAction,
    redirectToSubscribe,
    handleAiApiError,
    subscribePath: RECRUITER_SUBSCRIBE_PATH,
  };
};
