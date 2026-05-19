import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { handlePostJobAPI } from "../../../Api/postAPI";
import { getApiErrorMessage } from "../../../util/getApiErrorMessage";
import { PostJobForm } from "./admin components/PostJobForm";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/authSlice";

export const RegisterNewJob = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //   ONSUBMIT FN
  const onSubmit = async (data) => {
    try {
      dispatch(setLoading(true));
      const response = await handlePostJobAPI(data);
      if (response.data.SUCCESS) {
        toast.success(response.data.MESSAGE);
        navigate("/admin/jobs");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to post job"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <section>
      <div className=" mx-auto max-w-7xl mt-9 ">
        <h1 className="text-4xl text-zinc-800 font-bold dark:text-slate-100  text-center mb-3">
          <p className="md:text-5xl font-semibold  text-zinc-700 text-center dark:text-white">
            Post a{" "}
            <span className="text-blue-400 font-bold"> Job Opportunity</span>
          </p>
        </h1>

        <PostJobForm onSubmit={onSubmit} />
      </div>
    </section>
  );
};
