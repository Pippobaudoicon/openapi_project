import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../../models/User.js';
import { sendVerificationEmail } from '../../utils/emailService.js';

const router = express.Router();

// Login route
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

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({
            email,
            password: hashedPassword,
            verificationToken,
            isActive: false
        });

        await sendVerificationEmail(email, verificationToken);
        
        res.json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Verify email route
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        user.isActive = true;
        user.verificationToken = undefined;
        await user.save();

        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: 'Error logging in' });
            res.json({ message: 'Email verified successfully. You are now logged in.' });
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out' });
        res.json({ message: 'Logged out successfully' });
    });
});

// Check if user is authenticated for client-side
router.get('/check', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

export default router;
