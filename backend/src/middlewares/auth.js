import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        // Primary: httpOnly cookie set by /auth/login (this is what the frontend actually sends)
        let token = req.cookies?.token;

        // Fallback: Authorization: Bearer <token>, kept for non-browser / mobile clients
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const parts = authHeader.split(' ');
                if (parts.length === 2 && parts[0] === 'Bearer' && parts[1] && parts[1] !== 'null') {
                    token = parts[1];
                }
            }
        }

        if (!token) {
            return res.status(401).json({
                error: true,
                message: 'Authentication token missing'
            });
        }

        const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_2024_myclinic_doctor_portal';

        const decoded = jwt.verify(token, jwtSecret);

        res.locals.user = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            role: decoded.role,
            fullName: decoded.fullName
        };

        next();
    } catch (err) {
        console.error('Auth error:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                message: 'Token expired'
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: true,
                message: 'Invalid token'
            });
        }

        return res.status(401).json({
            error: true,
            message: 'Authentication failed'
        });
    }
};

const isAdmin = (req, res, next) => {
    if (res.locals.user?.role !== 'admin') {
        return res.status(403).json({
            error: true,
            message: 'Admin access required'
        });
    }
    next();
};

const isDoctor = (req, res, next) => {
    if (res.locals.user?.role !== 'doctor') {
        return res.status(403).json({
            error: true,
            message: 'Doctor access required'
        });
    }
    next();
};

const isPatient = (req, res, next) => {
    if (res.locals.user?.role !== 'patient') {
        return res.status(403).json({
            error: true,
            message: 'Patient access required'
        });
    }
    next();
};

export { authMiddleware as default, isAdmin, isDoctor, isPatient };