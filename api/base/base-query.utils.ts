export const buildAPIError = (e: any) => {
  const message =
    e.response?.data?.error?.message ||
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.message;

  const status =
    e.response?.data?.error?.status || e.response?.status || e.status || 500;

  return {
    message,
    status,
  };
};
