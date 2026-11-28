import jwt from 'jsonwebtoken';

/**
 * Require a valid `Authorization: Bearer <token>` header.
 * On success attaches `req.user = { _id, role, username, email }`.
 */
export const tokenChecker = (req, res, next) => {
  const header = req.headers.authorization || req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('[auth] JWT_SECRET is not configured');
    return res.status(500).json({ message: 'Server authentication is not configured.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    req.user = {
      _id: userId,
      role: decoded.role,
      username: decoded.username,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      message: expired
        ? 'Your session has expired. Please sign in again.'
        : 'Invalid authentication token.',
      code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }
};

/**
 * Role guard for routes that are not already guarded in the controller.
 */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to access this.' });
    }
    return next();
  };
