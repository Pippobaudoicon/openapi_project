import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info?.message });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            res.json({ message: info?.message });
        });
    })(req, res, next);
});

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { username: req.body.username, password: hashedPassword };
        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: 'Error logging in' });
            res.json({ message: 'User created and logged in successfully' });
        });
    } catch {
        res.status(500).json({ message: 'Error creating user' });
    }
});

router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out' });
        res.json({ message: 'Logged out successfully' });
    });
});

router.get('/check', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

export default router;
