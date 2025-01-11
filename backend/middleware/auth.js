const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    console.log('Auth middleware - headers:', req.headers);
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - token:', token);

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth middleware - decoded token:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth middleware - token verification error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 