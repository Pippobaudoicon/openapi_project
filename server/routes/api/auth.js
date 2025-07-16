import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/emailService.js';
import { 
    logActivity,
    getLoginMetadata,
    getLoginDescription,
    getLogoutMetadata,
    getLogoutDescription,
    getRegisterMetadata,
    getRegisterDescription,
    getChangePasswordMetadata,
    getChangePasswordDescription,
    getForgotPasswordMetadata,
    getForgotPasswordDescription,
    getResetPasswordMetadata,
    getResetPasswordDescription
 } from '../../middleware/activityLogger.js';

const router = express.Router();

// Login route
router.post('/login', logActivity({type:'login', action:'login', getDescription:getLoginDescription, getMetadata:getLoginMetadata}), (req, res, next) => {
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
router.post('/register', logActivity({type:'register', action:'register', getDescription:getRegisterDescription, getMetadata:getRegisterMetadata}), async (req, res) => {
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

// Change password route
router.post('/change-password', logActivity({type:'change-password', action:'change-password', getDescription:getChangePasswordDescription, getMetadata:getChangePasswordMetadata}), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in' });
    }

    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

// Forgot password - request reset
router.post('/forgot-password', logActivity({type:'forgot-password', action:'forgot-password', getDescription:getForgotPasswordDescription, getMetadata:getForgotPasswordMetadata}), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        // For security reasons, always return success even if email not found
        if (!user) {
            return res.json({ message: 'If your email is registered, you will receive a password reset link' });
        }
        
        // Generate reset token and expiration (1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        await sendPasswordResetEmail(email, resetToken);
        
        res.json({ message: 'If your email is registered, you will receive a password reset link' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Reset password with token
router.post('/reset-password/:token', logActivity({type:'reset-password', action:'reset-password', getDescription:getResetPasswordDescription, getMetadata:getResetPasswordMetadata}), async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }
        
        // Update password and clear reset fields
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Logout route
router.post('/logout', logActivity({type:'logout', action:'logout', getDescription:getLogoutDescription, getMetadata:getLogoutMetadata}), (req, res) => {
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
