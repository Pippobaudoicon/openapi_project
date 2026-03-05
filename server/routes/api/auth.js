import express from 'express';
import { requireAuth } from '../../middleware/betterAuth.js';

const router = express.Router();

// Session check (backward compat — clients can call this to verify auth status)
router.get('/check', async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            requireAuth(req, res, (err) => err ? reject(err) : resolve());
        });
        res.json({ isAuthenticated: true, user: req.user });
    } catch {
        res.json({ isAuthenticated: false });
    }
});

export default router;
