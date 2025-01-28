import Role from '../models/Role.js';

export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
        }

        // Allow if user's role is in the allowedRoles array
        if (Array.isArray(allowedRoles) && allowedRoles.includes(req.user.role)) {
            return next();
        }
        
        // Allow if single role is passed and matches
        if (typeof allowedRoles === 'string' && req.user.role === allowedRoles) {
            return next();
        }

        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    };
};

export const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
        }

        try {
            const userRole = await Role.findOne({ roleName: req.user.role });
            
            if (!userRole) {
                return res.status(403).json({ error: 'Role not found' });
            }

            if (userRole.permissions.includes(requiredPermission)) {
                return next();
            }

            return res.status(403).json({ error: 'Forbidden - Required permission not found' });
        } catch (error) {
            return res.status(500).json({ error: 'Error checking permissions' });
        }
    };
};
