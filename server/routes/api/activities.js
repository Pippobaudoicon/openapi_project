import express from 'express';
import { checkPermission } from '../../middleware/roleAuth.js';
import Activity from '../../models/Activity.js';

const router = express.Router();

// Get recent activities for the current user
router.get('/recent', 
  checkPermission('get_activities'), 
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await Activity.getRecent(req.user._id, limit);
      res.json({ success: true, data: activities });
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch recent activities' });
    }
  }
);

// Get activity statistics for the current user
router.get('/stats',
    checkPermission('get_activities'),
    async (req, res) => {
        try {
            const userId = req.user._id;
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            
            const [
                totalActivities,
                recentActivities,
                searchCount,
                companyReportsCount,
                visureCount
            ] = await Promise.all([
                Activity.countDocuments({ userId }),
                Activity.countDocuments({ userId, createdAt: { $gte: thirtyDaysAgo } }),
                Activity.countDocuments({ userId, type: 'search' }),
                Activity.countDocuments({ 
                    userId, 
                    type: { $in: ['company_advanced', 'company_full', 'company_status'] } 
                }),
                Activity.countDocuments({ 
                    userId, 
                    type: { $in: ['visure_request', 'bilancio_request'] } 
                })
            ]);
            
            res.json({
                success: true,
                data: {
                    totalActivities,
                    recentActivities,
                    searchCount,
                    companyReportsCount,
                    visureCount,
                    averagePerDay: Math.round(recentActivities / 30 * 10) / 10
                }
            });
        } catch (error) {
            console.error('Error fetching activity stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch activity statistics'
            });
        }
    }
);

// Get activity history with pagination
router.get('/history',
    checkPermission('get_activities'),
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const type = req.query.type; // Optional filter by type
            const skip = (page - 1) * limit;
            
            const filter = { userId: req.user._id };
            if (type) {
                filter.type = type;
            }
            
            const [activities, total] = await Promise.all([
                Activity.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Activity.countDocuments(filter)
            ]);
            
            res.json({
                success: true,
                data: {
                    activities,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching activity history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch activity history'
            });
        }
    }
);

// Manual activity logging (for custom events)
router.post('/log',
    checkPermission('log_activity'),
    async (req, res) => {
        try {
            const { type, action, description, metadata = {} } = req.body;
            if (!type || !action || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Type, action, and description are required'
                });
            }
            const activity = await Activity.log({
                userId: req.user._id,
                type,
                action,
                description,
                metadata,
                req
            });
            res.json({
                success: true,
                data: activity
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to log activity'
            });
        }
    }
);

export default router;
