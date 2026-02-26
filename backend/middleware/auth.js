import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_sati_secret_key_please_change_in_production';

export const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Attach the user payload to the request object
        req.user = decoded;

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    }
};

export const generateToken = (user) => {
    // Generate a token that expires in 24 hours
    return jwt.sign(
        {
            uid: user.uid,
            username: user.username,
            role: user.role
        },
        SECRET_KEY,
        { expiresIn: '24h' }
    );
};
