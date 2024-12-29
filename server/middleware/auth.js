import jwt from 'jsonwebtoken';
const secretString = process.env.SECRET_STRING



export const tokenChecker = (req, res, next) => {
    const authHeader = req.get('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided, please log in.' }); // Add `return` here
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, secretString);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token, please log in again.' }); // Add `return` here
        }

            req.user = {
            _id: decodedToken.id,
            role: decodedToken.role,
        };
              console.log(req.user)
        next(); 
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

