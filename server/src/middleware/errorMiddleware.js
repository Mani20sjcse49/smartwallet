export function errorHandler(error, req, res, next) {
  console.error(error);
  return res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}
