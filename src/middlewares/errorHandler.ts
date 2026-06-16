export const errorHandler = (
  err: Error,
  req: any,
  res: any,
  next: any
) => {
  res.status(500).json({
    success: false,
    message: err.message,
  });
};