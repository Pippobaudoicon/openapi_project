import express from 'express';
import User from '../../models/User.js';
import { checkPermission } from '../../middleware/roleAuth.js';
import { 
    logActivity
} from '../../middleware/activityLogger.js';

const router = express.Router();
    
// protect GET as well
router.get('/profile', checkPermission('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});

router.put('/profile', checkPermission('user'), async (req, res) => {
    try {
        const { firstName, lastName, company, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { firstName, lastName, company, phone } },
            { new: true, context: 'query' }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/profile', checkPermission('user'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json({ message: 'Profile deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

export default router;