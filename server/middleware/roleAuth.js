import Role from '../models/Role.js';

/**
 * Middleware function to check if a user has the required role(s) to access a route
 * @param {string|string[]} allowedRoles - Single role string or array of role strings that are allowed to access the route
 * @returns {Function} Express middleware function
 * @throws {Object} 401 error if user is not authenticated
 * @throws {Object} 403 error if user's role is not authorized
 * 
 * @example
 * // Single role check
 * app.get('/admin', checkRole('admin'), (req, res) => {})
 * 
 * @example
 * // Multiple roles check
 * app.get('/dashboard', checkRole(['admin', 'manager']), (req, res) => {})
 */
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

/**
 * Middleware function that checks if the authenticated user has the required permission.
 * @param {string} requiredPermission - The permission that needs to be checked against the user's role.
 * @returns {Function} Express middleware function that:
 *   - Checks if user is authenticated
 *   - Verifies if user's role exists
 *   - Validates if user's role has the required permission
 * @throws {401} If user is not authenticated
 * @throws {403} If role is not found or user lacks required permission
 * @throws {500} If there's an error during permission checking
 */
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
