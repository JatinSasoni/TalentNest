export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (data.MESSAGE) return data.MESSAGE;
  if (data.message) {
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return "All fields are required";
    }
    return data.message;
  }

  return fallback;
};
