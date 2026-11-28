import multer from 'multer';

export const notFound = (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    method: req.method,
    path: req.originalUrl,
  });
};

/**
 * Last middleware in the stack. Keeps every error response JSON-shaped so the
 * mobile client never has to parse an HTML error page.
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err instanceof multer.MulterError) {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large.';
    else if (err.code === 'LIMIT_FILE_COUNT') message = 'Too many files uploaded.';
    else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field || 'unknown'}.`;
    } else message = `Upload error: ${err.message}`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})
      .map((item) => item.message)
      .join(', ') || 'Validation failed.';
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path || 'field'}.`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body.';
  }

  console.error(`[error] ${req.method} ${req.originalUrl} -> ${status}:`, err);

  const body = { message };
  if (process.env.NODE_ENV !== 'production') {
    if (err.code) body.code = err.code;
    if (err.name) body.name = err.name;
  }

  return res.status(status).json(body);
};
