import '../config/env.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.SERVER_URL}/api/v1/auth/verify/${token}`;
    
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Verify Your Email',
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>If you didn't request this verification, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.SERVER_URL}/reset-password/${token}`;
    
    const subject = 'Password Reset Request';
    const htmlContent = `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `;
    console.log(`Password reset email would be sent to ${email} with token ${token}`);
    return;
    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};
