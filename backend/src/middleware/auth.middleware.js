import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // ✅ Allow cron jobs using a secret header
    if (!authHeader) {
        if (req.headers['x-cron-job-secret'] === process.env.CRON_SECRET) {
            console.log('Cron job request allowed.');
            return next();
        }
        return res.status(401).json({ error: 'No token provided' });
    }

    // Must start with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid auth format' });
    }

    const token = authHeader.split(' ')[1];

    // Handle empty token
    if (!token) {
        return res.status(401).json({ error: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the DB
        req.user = await User.findById(decoded.userId).select('-password');
        if (!req.user) {
            return res.status(401).json({ error: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('Error in auth middleware:', error.message);
        return res.status(401).json({ error: 'Token is not valid' });
    }
};
