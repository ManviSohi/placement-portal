const { verifyToken } = require('../utils/jwt.utils');
const { createError } = require('./error.middleware');

// protect: this middleware runs before any protected route.
// It extracts the token from the Authorization header,
// verifies it, and attaches the decoded user to req.user.
// Every subsequent middleware and controller can then read req.user.


const protect=(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(createError(401, 'No token provided'));
        }
        const token = authHeader.split(' ')[1];
        if(!token ){
            throw createError(401, 'No token provided');
        }
        const decoded = verifyToken(token);
        req.user = decoded;

        next();

    }
    catch(error){
        if(error.name === 'TokenExpiredError'){
            return next(createError(401, 'Token expired'));
        }
        if(error.name === 'JsonWebTokenError'){
            return next(createError(401, 'Invalid token'));
        }
        next(error);
    }

};

module.exports = { protect };