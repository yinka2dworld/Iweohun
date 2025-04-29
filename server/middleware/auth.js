import jwt from 'jsonwebtoken'; 

export const tokenChecker = (req, res, next) => {
  
    const authHeader = req.get('Authorization');
  
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }
  
      req.user = {
        _id: decodedToken.userId,
        role: decodedToken.role,
      };
  
      next();
    } catch (error) {
      console.error('JWT Error:', error.message); 
      return res.status(400).json({ error: 'Token verification failed: ' + error.message });
    }
  };
  
