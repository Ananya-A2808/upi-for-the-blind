// Simple middleware for now - we'll implement actual face recognition on frontend
const verifyFace = async (req, res, next) => {
    // For now, just pass through without face verification
    next();
};

module.exports = verifyFace; 